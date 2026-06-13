create table if not exists priorities (
  id text primary key,
  "momentId" text not null unique references "Moment"(id) on delete cascade,
  rank integer not null,
  bucket text not null check (bucket in ('immediate', 'soon', 'backlog', 'archived')),
  reason text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "priorities_bucket_rank_idx" on priorities(bucket, rank);

create table if not exists arcs (
  id text primary key,
  owner text not null,
  title text not null,
  summary text not null,
  confidence double precision not null,
  status text not null check (status in ('draft', 'approved', 'archived')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "arcs_owner_status_idx" on arcs(owner, status);

create table if not exists arc_thread (
  id text primary key,
  "arcId" text not null references arcs(id) on delete cascade,
  "threadId" text not null,
  "createdAt" timestamptz not null default now(),
  unique ("arcId", "threadId")
);

create index if not exists "arc_thread_threadId_idx" on arc_thread("threadId");

insert into storage.buckets (id, name, public)
values ('whiteboard-exports', 'whiteboard-exports', false)
on conflict (id) do nothing;
