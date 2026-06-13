alter table public."File" enable row level security;

drop policy if exists "authenticated_select_File" on public."File";
create policy "authenticated_select_File"
on public."File"
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_File" on public."File";
create policy "authenticated_insert_File"
on public."File"
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_File" on public."File";
create policy "authenticated_update_File"
on public."File"
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_File" on public."File";
create policy "authenticated_delete_File"
on public."File"
for delete
to authenticated
using (true);

alter table public."ExtractedContent" enable row level security;

drop policy if exists "authenticated_select_ExtractedContent" on public."ExtractedContent";
create policy "authenticated_select_ExtractedContent"
on public."ExtractedContent"
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_ExtractedContent" on public."ExtractedContent";
create policy "authenticated_insert_ExtractedContent"
on public."ExtractedContent"
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_ExtractedContent" on public."ExtractedContent";
create policy "authenticated_update_ExtractedContent"
on public."ExtractedContent"
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_ExtractedContent" on public."ExtractedContent";
create policy "authenticated_delete_ExtractedContent"
on public."ExtractedContent"
for delete
to authenticated
using (true);

alter table public."Signal" enable row level security;

drop policy if exists "authenticated_select_Signal" on public."Signal";
create policy "authenticated_select_Signal"
on public."Signal"
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_Signal" on public."Signal";
create policy "authenticated_insert_Signal"
on public."Signal"
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_Signal" on public."Signal";
create policy "authenticated_update_Signal"
on public."Signal"
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_Signal" on public."Signal";
create policy "authenticated_delete_Signal"
on public."Signal"
for delete
to authenticated
using (true);

alter table public."Moment" enable row level security;

drop policy if exists "authenticated_select_Moment" on public."Moment";
create policy "authenticated_select_Moment"
on public."Moment"
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_Moment" on public."Moment";
create policy "authenticated_insert_Moment"
on public."Moment"
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_Moment" on public."Moment";
create policy "authenticated_update_Moment"
on public."Moment"
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_Moment" on public."Moment";
create policy "authenticated_delete_Moment"
on public."Moment"
for delete
to authenticated
using (true);

alter table public."MomentEvidence" enable row level security;

drop policy if exists "authenticated_select_MomentEvidence" on public."MomentEvidence";
create policy "authenticated_select_MomentEvidence"
on public."MomentEvidence"
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_MomentEvidence" on public."MomentEvidence";
create policy "authenticated_insert_MomentEvidence"
on public."MomentEvidence"
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_MomentEvidence" on public."MomentEvidence";
create policy "authenticated_update_MomentEvidence"
on public."MomentEvidence"
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_MomentEvidence" on public."MomentEvidence";
create policy "authenticated_delete_MomentEvidence"
on public."MomentEvidence"
for delete
to authenticated
using (true);

alter table public."ReviewQueue" enable row level security;

drop policy if exists "authenticated_select_ReviewQueue" on public."ReviewQueue";
create policy "authenticated_select_ReviewQueue"
on public."ReviewQueue"
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_ReviewQueue" on public."ReviewQueue";
create policy "authenticated_insert_ReviewQueue"
on public."ReviewQueue"
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_ReviewQueue" on public."ReviewQueue";
create policy "authenticated_update_ReviewQueue"
on public."ReviewQueue"
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_ReviewQueue" on public."ReviewQueue";
create policy "authenticated_delete_ReviewQueue"
on public."ReviewQueue"
for delete
to authenticated
using (true);

alter table public."DuplicateGroup" enable row level security;

drop policy if exists "authenticated_select_DuplicateGroup" on public."DuplicateGroup";
create policy "authenticated_select_DuplicateGroup"
on public."DuplicateGroup"
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_DuplicateGroup" on public."DuplicateGroup";
create policy "authenticated_insert_DuplicateGroup"
on public."DuplicateGroup"
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_DuplicateGroup" on public."DuplicateGroup";
create policy "authenticated_update_DuplicateGroup"
on public."DuplicateGroup"
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_DuplicateGroup" on public."DuplicateGroup";
create policy "authenticated_delete_DuplicateGroup"
on public."DuplicateGroup"
for delete
to authenticated
using (true);

alter table public."DuplicateItem" enable row level security;

drop policy if exists "authenticated_select_DuplicateItem" on public."DuplicateItem";
create policy "authenticated_select_DuplicateItem"
on public."DuplicateItem"
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_DuplicateItem" on public."DuplicateItem";
create policy "authenticated_insert_DuplicateItem"
on public."DuplicateItem"
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_DuplicateItem" on public."DuplicateItem";
create policy "authenticated_update_DuplicateItem"
on public."DuplicateItem"
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_DuplicateItem" on public."DuplicateItem";
create policy "authenticated_delete_DuplicateItem"
on public."DuplicateItem"
for delete
to authenticated
using (true);

alter table public.users enable row level security;

drop policy if exists "authenticated_select_users" on public.users;
create policy "authenticated_select_users"
on public.users
for select
to authenticated
using (true);

alter table public.audit_log enable row level security;

drop policy if exists "authenticated_select_audit_log" on public.audit_log;
create policy "authenticated_select_audit_log"
on public.audit_log
for select
to authenticated
using (true);

alter table public.priorities enable row level security;

drop policy if exists "authenticated_select_priorities" on public.priorities;
create policy "authenticated_select_priorities"
on public.priorities
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_priorities" on public.priorities;
create policy "authenticated_insert_priorities"
on public.priorities
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_priorities" on public.priorities;
create policy "authenticated_update_priorities"
on public.priorities
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_priorities" on public.priorities;
create policy "authenticated_delete_priorities"
on public.priorities
for delete
to authenticated
using (true);

alter table public.arcs enable row level security;

drop policy if exists "authenticated_select_arcs" on public.arcs;
create policy "authenticated_select_arcs"
on public.arcs
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_arcs" on public.arcs;
create policy "authenticated_insert_arcs"
on public.arcs
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_arcs" on public.arcs;
create policy "authenticated_update_arcs"
on public.arcs
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_arcs" on public.arcs;
create policy "authenticated_delete_arcs"
on public.arcs
for delete
to authenticated
using (true);

alter table public.arc_thread enable row level security;

drop policy if exists "authenticated_select_arc_thread" on public.arc_thread;
create policy "authenticated_select_arc_thread"
on public.arc_thread
for select
to authenticated
using (true);

drop policy if exists "authenticated_insert_arc_thread" on public.arc_thread;
create policy "authenticated_insert_arc_thread"
on public.arc_thread
for insert
to authenticated
with check (true);

drop policy if exists "authenticated_update_arc_thread" on public.arc_thread;
create policy "authenticated_update_arc_thread"
on public.arc_thread
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_delete_arc_thread" on public.arc_thread;
create policy "authenticated_delete_arc_thread"
on public.arc_thread
for delete
to authenticated
using (true);
