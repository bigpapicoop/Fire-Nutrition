-- Fire Nutrition shared recipes: run once in Supabase → SQL Editor.
--
-- Rules, enforced by the database itself (not just the app):
--   * Anyone can read recipes.
--   * Anyone can add a recipe (no sign-in needed).
--   * Nobody can edit a recipe after it's posted.
--   * Only people listed in `admins` can delete recipes.

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 500),
  category text not null check (category in ('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert')),
  emoji text not null default '🍲' check (char_length(emoji) <= 8),
  prep_minutes int not null default 0 check (prep_minutes between 0 and 1440),
  cook_minutes int not null default 0 check (cook_minutes between 0 and 1440),
  servings int not null default 1 check (servings between 1 and 100),
  macros jsonb not null check (jsonb_typeof(macros) = 'object'),
  tags text[] not null default '{}' check (cardinality(tags) <= 20),
  ingredients jsonb not null check (
    jsonb_typeof(ingredients) = 'array'
    and jsonb_array_length(ingredients) between 1 and 100
    and octet_length(ingredients::text) <= 20000
  ),
  steps jsonb not null check (
    jsonb_typeof(steps) = 'array'
    and jsonb_array_length(steps) between 1 and 100
    and octet_length(steps::text) <= 20000
  )
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.recipes enable row level security;
alter table public.admins enable row level security;

drop policy if exists "anyone can read recipes" on public.recipes;
create policy "anyone can read recipes" on public.recipes
  for select to anon, authenticated using (true);

drop policy if exists "anyone can add recipes" on public.recipes;
create policy "anyone can add recipes" on public.recipes
  for insert to anon, authenticated with check (true);

drop policy if exists "only admins can delete recipes" on public.recipes;
create policy "only admins can delete recipes" on public.recipes
  for delete to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admins can see their own admin row" on public.admins;
create policy "admins can see their own admin row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- No update policy on recipes: editing is not allowed for anyone.
-- No insert/delete policy on admins: admins are only added from this SQL editor.

grant select, insert on public.recipes to anon, authenticated;
grant delete on public.recipes to authenticated;
grant select on public.admins to authenticated;

-- Create your admin account in Supabase → Authentication → Users → Add user (email + password),
-- then make it an admin by running:
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'YOUR-EMAIL-HERE';
