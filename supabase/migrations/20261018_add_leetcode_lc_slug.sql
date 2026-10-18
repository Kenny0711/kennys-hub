-- Existing leetcode_records tables predate the lc_slug field in schema.sql.
alter table public.leetcode_records
  add column if not exists lc_slug text;
