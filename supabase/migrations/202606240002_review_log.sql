create table if not exists review_log (
  id text primary key,
  file_id text references public."File"(id) on delete set null,
  user_id text not null,
  action text,
  ts timestamptz not null default now()
);

create index if not exists review_log_file_id_idx on public.review_log(file_id);
create index if not exists review_log_user_id_idx on public.review_log(user_id);

alter table public.review_log enable row level security;

drop policy if exists "authenticated_select_review_log" on public.review_log;
create policy "authenticated_select_review_log"
on public.review_log
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_review_log" on public.review_log;
create policy "authenticated_insert_review_log"
on public.review_log
for insert
to authenticated
with check (true);
