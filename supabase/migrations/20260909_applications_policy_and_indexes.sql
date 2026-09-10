-- ============================================================================
-- v2.8.2 (2026-09-09) — applications_open_insert position check was a
-- tautology: inside the recruitment_positions p subquery, unqualified
-- "recruitment_id" bound to p (which has that column) →
-- "p.recruitment_id = p.recruitment_id" = always true. An applicant could
-- pair a position belonging to a DIFFERENT recruitment with an open campaign
-- (FK + open-campaign gates still held — integrity flaw, not privesc).
-- Fix: qualify only the ambiguous inner comparison with "applications.";
-- outer column references stay unqualified (the fully-qualified first attempt
-- broke all anon inserts — in an INSERT WITH CHECK, unqualified names bind to
-- the proposed row). Also: FK support indexes on invite_links (perf advisor).
--
-- NOTE: in prod this landed as two ledger entries
-- (applications_position_campaign_fix, then applications_policy_qualification_fix);
-- this file records the final live state. REST-verified live: valid pairing
-- 201, mismatched-position pairing 42501.
-- ============================================================================

drop policy if exists "applications_open_insert" on public.applications;
create policy "applications_open_insert" on public.applications
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.recruitments r
      where r.id = recruitment_id and r.is_open
    )
    and (
      position_id is null or exists (
        select 1 from public.recruitment_positions p
        where p.id = position_id and p.recruitment_id = applications.recruitment_id
      )
    )
    and (profile_id is null or profile_id = (select auth.uid()))
    and status = 'new'
  );

create index if not exists invite_links_created_by_idx on public.invite_links (created_by);
create index if not exists invite_links_used_by_idx on public.invite_links (used_by);
