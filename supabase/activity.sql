-- Fire Nutrition phone notifications. Run once in Supabase → SQL Editor.
-- Replace YOUR-NTFY-TOPIC with your private ntfy channel name before running.
--
--   * Each device sends ONE anonymous signal the first time it opens the app (no names or personal data).
--   * A push notification goes to your ntfy channel (https://ntfy.sh) for each new visitor,
--     and whenever a community recipe is added.
--   * Anyone can add a visitor row; nobody can read the table through the app.

create extension if not exists pg_net with schema extensions;

create table if not exists public.new_visitors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  platform text check (char_length(platform) <= 40),
  installed boolean not null default false
);

alter table public.new_visitors enable row level security;

drop policy if exists "anyone can log a new visitor" on public.new_visitors;
create policy "anyone can log a new visitor" on public.new_visitors
  for insert to anon, authenticated with check (true);

grant insert on public.new_visitors to anon, authenticated;

create or replace function public.notify_phone()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  t text;
  m text;
  tags jsonb;
begin
  if tg_table_name = 'recipes' then
    t := 'New community recipe';
    m := new.title || ' (' || new.category || ', ' || coalesce(new.macros ->> 'protein', '?') || 'g protein)';
    tags := '["fork_and_knife"]';
  else
    t := 'New visitor opened Fire Nutrition';
    m := coalesce(new.platform, 'Unknown device') || case when new.installed then ' · home-screen app' else ' · browser' end;
    tags := '["tada"]';
  end if;

  perform net.http_post(
    url := 'https://ntfy.sh/',
    body := jsonb_build_object('topic', 'YOUR-NTFY-TOPIC', 'title', t, 'message', m, 'tags', tags)
  );
  return new;
end;
$$;

drop trigger if exists notify_on_new_visitor on public.new_visitors;
create trigger notify_on_new_visitor after insert on public.new_visitors
  for each row execute function public.notify_phone();

drop trigger if exists notify_on_recipe on public.recipes;
create trigger notify_on_recipe after insert on public.recipes
  for each row execute function public.notify_phone();
