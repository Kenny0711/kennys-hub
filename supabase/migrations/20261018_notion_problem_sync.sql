-- Apply in Supabase SQL Editor before enabling Notion sync.
create table if not exists public.notion_problem_sync (
  problem_id integer primary key references public.leetcode_records(problem_id) on delete cascade,
  notion_page_id uuid unique,
  notion_url text,
  date_solved date,
  difficulty text,
  time_complexity text[],
  space_complexity text[],
  notes_markdown text,
  notion_last_edited_at timestamptz,
  pushed_fingerprint text,
  generation bigint not null default 0,
  needs_push boolean not null default false,
  lease_until timestamptz,
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  last_synced_at timestamptz
);

create index if not exists idx_notion_problem_sync_queue
  on public.notion_problem_sync (next_attempt_at)
  where needs_push;

create table if not exists public.notion_webhook_setup (
  id boolean primary key default true check (id),
  verification_token text not null,
  received_at timestamptz not null default now()
);
alter table public.notion_webhook_setup enable row level security;

alter table public.notion_problem_sync enable row level security;
drop policy if exists "Public can read cached Notion fields" on public.notion_problem_sync;
create policy "Public can read cached Notion fields"
  on public.notion_problem_sync for select to anon, authenticated using (true);

create or replace function public.enqueue_notion_problem(p_problem_id integer)
returns void language sql security definer set search_path = public as $$
  insert into public.notion_problem_sync (problem_id, needs_push, generation)
  values (p_problem_id, true, 1)
  on conflict (problem_id) do update
    set needs_push = true,
        generation = notion_problem_sync.generation + 1,
        next_attempt_at = now();
$$;

create or replace function public.append_accepted_solution(
  p_problem_id integer, p_title text, p_difficulty text, p_tags text[],
  p_lc_slug text, p_solution jsonb
) returns table (record_id uuid, added boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_solutions jsonb;
  v_submission_id text := p_solution->>'submission_id';
begin
  insert into public.leetcode_records (problem_id, title, difficulty, tags, solutions)
  values (p_problem_id, p_title, p_difficulty, coalesce(p_tags, '{}'), '[]'::jsonb)
  on conflict (problem_id) do nothing;
  select id, solutions into v_id, v_solutions
  from public.leetcode_records where problem_id = p_problem_id for update;
  if v_submission_id is not null and exists (
    select 1 from jsonb_array_elements(v_solutions) item
    where item->>'submission_id' = v_submission_id
  ) then
    return query select v_id, false;
    return;
  end if;
  update public.leetcode_records
  set title = p_title, difficulty = p_difficulty, tags = coalesce(p_tags, '{}'),
      lc_slug = coalesce(nullif(p_lc_slug, ''), lc_slug),
      solutions = v_solutions || jsonb_build_array(p_solution)
  where id = v_id;
  return query select v_id, true;
end;
$$;

create or replace function public.claim_notion_problem()
returns table (problem_id integer, generation bigint, attempts integer)
language plpgsql security definer set search_path = public as $$
begin
  return query
  with candidate as (
    select s.problem_id from public.notion_problem_sync s
    where s.needs_push
      and s.next_attempt_at <= now()
      and (s.lease_until is null or s.lease_until < now())
    order by s.next_attempt_at, s.problem_id
    for update skip locked limit 1
  )
  update public.notion_problem_sync s
     set lease_until = now() + interval '5 minutes'
    from candidate c
   where s.problem_id = c.problem_id
  returning s.problem_id, s.generation, s.attempts;
end;
$$;

create or replace function public.store_notion_snapshot(
  p_problem_id integer, p_page_id uuid, p_url text,
  p_edited_at timestamptz, p_fields jsonb
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.notion_problem_sync (
    problem_id, notion_page_id, notion_url, notion_last_edited_at,
    date_solved, difficulty, time_complexity, space_complexity, notes_markdown, last_synced_at
  ) values (
    p_problem_id, p_page_id, p_url, p_edited_at,
    (p_fields->>'date_solved')::date,
    p_fields->>'difficulty',
    case when p_fields ? 'time_complexity' then
      array(select jsonb_array_elements_text(p_fields->'time_complexity')) end,
    case when p_fields ? 'space_complexity' then
      array(select jsonb_array_elements_text(p_fields->'space_complexity')) end,
    p_fields->>'notes_markdown', now()
  ) on conflict (problem_id) do update set
    notion_page_id = excluded.notion_page_id,
    notion_url = excluded.notion_url,
    notion_last_edited_at = excluded.notion_last_edited_at,
    date_solved = coalesce(notion_problem_sync.date_solved, excluded.date_solved),
    difficulty = case when p_fields ? 'difficulty' then excluded.difficulty else notion_problem_sync.difficulty end,
    time_complexity = case when p_fields ? 'time_complexity' then excluded.time_complexity else notion_problem_sync.time_complexity end,
    space_complexity = case when p_fields ? 'space_complexity' then excluded.space_complexity else notion_problem_sync.space_complexity end,
    notes_markdown = case when p_fields ? 'notes_markdown' then excluded.notes_markdown else notion_problem_sync.notes_markdown end,
    last_synced_at = now()
  where (notion_problem_sync.notion_page_id is null or notion_problem_sync.notion_page_id = p_page_id)
    and (notion_problem_sync.notion_last_edited_at is null or notion_problem_sync.notion_last_edited_at <= p_edited_at);
end;
$$;

create or replace function public.complete_notion_push(
  p_problem_id integer, p_generation bigint, p_fingerprint text, p_date_solved date
) returns void language sql security definer set search_path = public as $$
  update public.notion_problem_sync
  set needs_push = case when generation = p_generation then false else needs_push end,
      lease_until = null, attempts = 0, last_error = null,
      pushed_fingerprint = p_fingerprint,
      date_solved = coalesce(date_solved, p_date_solved),
      last_synced_at = now()
  where problem_id = p_problem_id;
$$;

create or replace function public.fail_notion_push(
  p_problem_id integer, p_generation bigint, p_error text
) returns void language sql security definer set search_path = public as $$
  update public.notion_problem_sync
  set lease_until = null,
      attempts = case when generation = p_generation then attempts + 1 else 0 end,
      next_attempt_at = case when generation = p_generation
        then now() + make_interval(mins => least(60, power(2, least(attempts, 6))::integer))
        else now() end,
      last_error = left(p_error, 200)
  where problem_id = p_problem_id;
$$;

revoke all on function public.enqueue_notion_problem(integer) from public, anon, authenticated;
revoke all on function public.append_accepted_solution(integer, text, text, text[], text, jsonb) from public, anon, authenticated;
revoke all on function public.claim_notion_problem() from public, anon, authenticated;
revoke all on function public.store_notion_snapshot(integer, uuid, text, timestamptz, jsonb) from public, anon, authenticated;
revoke all on function public.complete_notion_push(integer, bigint, text, date) from public, anon, authenticated;
revoke all on function public.fail_notion_push(integer, bigint, text) from public, anon, authenticated;
grant execute on function public.enqueue_notion_problem(integer) to service_role;
grant execute on function public.append_accepted_solution(integer, text, text, text[], text, jsonb) to service_role;
grant execute on function public.claim_notion_problem() to service_role;
grant execute on function public.store_notion_snapshot(integer, uuid, text, timestamptz, jsonb) to service_role;
grant execute on function public.complete_notion_push(integer, bigint, text, date) to service_role;
grant execute on function public.fail_notion_push(integer, bigint, text) to service_role;
