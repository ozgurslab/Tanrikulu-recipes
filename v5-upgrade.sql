-- Tanrikulu Recipes V5
-- Run once in Supabase SQL Editor before using the new contributor field.
alter table public.recipes
add column if not exists contributor_name text default '';
