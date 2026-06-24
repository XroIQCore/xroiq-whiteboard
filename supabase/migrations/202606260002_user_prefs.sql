create table if not exists user_prefs (
  id text primary key,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_prefs enable row level security;

drop policy if exists "authenticated_select_user_prefs" on public.user_prefs;
create policy "authenticated_select_user_prefs"
on public.user_prefs
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_user_prefs" on public.user_prefs;
create policy "authenticated_insert_user_prefs"
on public.user_prefs
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_user_prefs" on public.user_prefs;
create policy "authenticated_update_user_prefs"
on public.user_prefs
for update
to authenticated
using (true)
with check (true);
