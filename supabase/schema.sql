-- LeetCode Tracker — Supabase 建表 SQL
-- 在 Supabase Dashboard > SQL Editor 執行此檔案

create table public.leetcode_records (
  id           uuid primary key default gen_random_uuid(),
  problem_id   integer not null,
  title        text not null,
  difficulty   text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  tags         text[] not null default '{}',
  proficiency  text not null default '理解' check (proficiency in ('生疏', '理解', '熟練')),
  solutions    jsonb not null default '[]'::jsonb,
  lc_slug      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- problem_id 唯一約束（用於 upsert）
alter table public.leetcode_records
  add constraint uq_problem_id unique (problem_id);

-- 個人使用，停用 Row Level Security
alter table public.leetcode_records disable row level security;

-- 自動更新 updated_at 觸發器
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_leetcode_records_updated_at
  before update on public.leetcode_records
  for each row execute function public.set_updated_at();
