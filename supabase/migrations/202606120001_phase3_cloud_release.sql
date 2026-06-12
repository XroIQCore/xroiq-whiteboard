create table if not exists "File" (
  id text primary key,
  owner text not null default 'unassigned',
  name text not null,
  type text not null,
  size integer not null,
  hash text not null,
  "storagePath" text not null,
  status text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists "ExtractedContent" (
  id text primary key,
  "fileId" text not null references "File"(id) on delete cascade,
  content text not null,
  "storagePath" text,
  confidence double precision not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists "Signal" (
  id text primary key,
  "extractedContentId" text not null references "ExtractedContent"(id) on delete cascade,
  content text not null,
  confidence double precision not null,
  status text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists "Moment" (
  id text primary key,
  owner text not null default 'unassigned',
  "threadId" text,
  title text,
  context text not null,
  intention text,
  need text,
  state text not null,
  consent text not null,
  outcome text,
  confidence double precision not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "MomentEvidence" (
  id text primary key,
  "momentId" text not null references "Moment"(id) on delete cascade,
  "signalId" text not null references "Signal"(id) on delete cascade,
  "fileId" text references "File"(id)
);

create table if not exists "ReviewQueue" (
  id text primary key,
  "objectType" text not null,
  "objectId" text not null,
  reason text not null,
  status text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists "DuplicateGroup" (
  id text primary key,
  confidence double precision not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists "DuplicateItem" (
  id text primary key,
  "groupId" text not null references "DuplicateGroup"(id) on delete cascade,
  "objectType" text not null,
  "objectId" text not null
);

create table if not exists users (
  id text primary key,
  email text not null unique,
  role text not null default 'operator',
  "createdAt" timestamptz not null default now()
);

create table if not exists audit_log (
  id text primary key,
  actor text,
  event text not null,
  "objectType" text not null,
  "objectId" text,
  payload jsonb,
  "createdAt" timestamptz not null default now()
);

create index if not exists "Moment_owner_intention_idx" on "Moment"(owner, intention);
create index if not exists "Moment_threadId_idx" on "Moment"("threadId");
create index if not exists "AuditLog_event_idx" on audit_log(event);
create index if not exists "AuditLog_createdAt_idx" on audit_log("createdAt");

insert into storage.buckets (id, name, public)
values ('whiteboard-originals', 'whiteboard-originals', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('whiteboard-extracted-text', 'whiteboard-extracted-text', false)
on conflict (id) do nothing;
