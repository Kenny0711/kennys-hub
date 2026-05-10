-- Kenny 的研發日誌 — Supabase 建表 SQL
-- 在 Supabase Dashboard > SQL Editor 執行此檔案

create table if not exists public.leetcode_records (
  id           uuid primary key default gen_random_uuid(),
  problem_id   integer not null,
  title        text not null,
  difficulty   text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  tags         text[] not null default '{}',
  proficiency  text not null default '理解' check (proficiency in ('生疏', '理解', '熟練')),
  solutions    jsonb not null default '[]'::jsonb,
  lc_slug      text,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- problem_id 唯一約束（用於 upsert）
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'uq_problem_id'
      and conrelid = 'public.leetcode_records'::regclass
  ) then
    alter table public.leetcode_records
      add constraint uq_problem_id unique (problem_id);
  end if;
end;
$$;

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

drop trigger if exists trg_leetcode_records_updated_at on public.leetcode_records;

create trigger trg_leetcode_records_updated_at
  before update on public.leetcode_records
  for each row execute function public.set_updated_at();

-- Kenny's Dev Hub portfolio projects.
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null default '',
  project_url  text not null default '',
  image_url    text not null default '',
  tags         text[] not null default '{}',
  is_featured  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.projects
  add column if not exists project_url text not null default '';

create index if not exists idx_projects_featured_created_at
  on public.projects (is_featured, created_at desc);

alter table public.projects enable row level security;

drop trigger if exists trg_projects_updated_at on public.projects;

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();
