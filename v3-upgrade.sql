-- Tanrikulu Recipes V3
insert into public.categories (name, sort_order) values ('Dessert', 10) on conflict (name) do nothing;
