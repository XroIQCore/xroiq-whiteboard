create extension if not exists vector;

do $$
begin
  create type category_enum as enum ('operating-system','framework','design','task','note','junk');
exception
  when duplicate_object then null;
end $$;

alter table public."File"
  add column if not exists raw_text text,
  add column if not exists category category_enum,
  add column if not exists sub_bucket text,
  add column if not exists needs_attention boolean not null default false,
  add column if not exists duplicate_of text null references public."File"(id),
  add column if not exists summary text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists "File_owner_category_idx" on public."File"(owner, category);
create index if not exists "File_tsv_idx" on public."File" using gin (to_tsvector('english', coalesce(raw_text, '')));

create table if not exists file_vector (
  id text primary key references public."File"(id) on delete cascade,
  vec vector(384)
);

create index if not exists file_vec_idx on file_vector using ivfflat (vec vector_cosine_ops) with (lists = 100);

create table if not exists memory_entries (
  id text primary key,
  source_file text not null unique references public."File"(id) on delete cascade,
  arc_id text null references public.arcs(id) on delete set null,
  summary text,
  keywords text[] not null default '{}',
  confidence double precision not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists "memory_entries_arc_id_idx" on memory_entries(arc_id);
create index if not exists "memory_entries_status_idx" on memory_entries(status);

alter table public.file_vector enable row level security;

drop policy if exists "authenticated_select_file_vector" on public.file_vector;
create policy "authenticated_select_file_vector"
on public.file_vector
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_file_vector" on public.file_vector;
create policy "authenticated_insert_file_vector"
on public.file_vector
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_file_vector" on public.file_vector;
create policy "authenticated_update_file_vector"
on public.file_vector
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_file_vector" on public.file_vector;
create policy "authenticated_delete_file_vector"
on public.file_vector
for delete
to authenticated
using (true);

alter table public.memory_entries enable row level security;

drop policy if exists "authenticated_select_memory_entries" on public.memory_entries;
create policy "authenticated_select_memory_entries"
on public.memory_entries
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_memory_entries" on public.memory_entries;
create policy "authenticated_insert_memory_entries"
on public.memory_entries
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_memory_entries" on public.memory_entries;
create policy "authenticated_update_memory_entries"
on public.memory_entries
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_memory_entries" on public.memory_entries;
create policy "authenticated_delete_memory_entries"
on public.memory_entries
for delete
to authenticated
using (true);
