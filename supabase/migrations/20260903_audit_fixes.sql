-- ============================================================================
-- v2.6 (2026-09-03) — round-2 audit fixes.
--  1. applications: the anon role holds column INSERT grants (PostgREST
--     needs them), so a client could forge created_at into the past and the
--     300/hour flood cap would never count those rows. The trigger now pins
--     created_at to now() server-side — the cap counts real time again.
--  2. storage UPDATE policies: x-upsert uploads take the UPDATE path, which
--     had no WITH CHECK — the INSERT mime/size whitelist was skippable on
--     any existing path. Both UPDATE policies now re-check the same
--     constraints as their INSERT counterparts.
--  3. applications_open_insert: auth.uid() wrapped as an initplan
--     (performance advisor 0003) — evaluated once per statement, not per row.
--  4. FK support index on applications.profile_id (advisor 0001).
--  5. claim_announcement_email(): atomic emailed_at claim so two concurrent
--     broadcasts cannot both pass the "not sent yet" check and double-email
--     the whole member list.
-- ============================================================================

-- 1. Pin created_at server-side ---------------------------------------------
create or replace function public.guard_application_submit()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- anon/authenticated hold INSERT grants on created_at (PostgREST inserts
  -- set it column-wise); a forged past timestamp would dodge the flood cap.
  new.created_at := now();
  -- Same identity (name + phone) may not submit twice for one campaign —
  -- also catches double-click races with a readable French message.
  if exists (
    select 1 from public.applications a
    where a.recruitment_id = new.recruitment_id
      and lower(a.full_name) = lower(new.full_name)
      and a.phone = new.phone
  ) then
    raise exception 'Une candidature avec ce nom et ce téléphone existe déjà pour cet appel.';
  end if;
  -- Flood backstop: a burst of submissions in one hour means a script, not
  -- a club drive (whole club is a few hundred students).
  if (select count(*) from public.applications a where a.created_at > now() - interval '1 hour') >= 300 then
    raise exception 'Trop de candidatures reçues cette heure — réessayez dans quelques instants.';
  end if;
  return new;
end;
$$;

-- 2. Storage UPDATE policies mirror their INSERT constraints ---------------
drop policy if exists "avatars_self_update" on storage.objects;
create policy "avatars_self_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and coalesce((metadata->>'size')::bigint, 0) <= 5242880 -- 5 MB
    and coalesce(metadata->>'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

drop policy if exists "club_media_bureau_update" on storage.objects;
create policy "club_media_bureau_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'club-media' and public.is_bureau_or_admin())
  with check (
    bucket_id = 'club-media'
    and (select public.is_bureau_or_admin())
    and coalesce((metadata->>'size')::bigint, 0) <= 26214400 -- 25 MB
    and coalesce(metadata->>'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

-- 3. Initplan form for auth.uid() in the insert policy ----------------------
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
        where p.id = position_id and p.recruitment_id = recruitment_id
      )
    )
    and (profile_id is null or profile_id = (select auth.uid()))
    and status = 'new'
  );

-- 4. FK support index --------------------------------------------------------
create index if not exists idx_applications_profile
  on public.applications (profile_id);

-- 5. Atomic broadcast claim ---------------------------------------------------
-- Returns true when this caller won the emailed_at claim (and therefore
-- may send). The "already sent" state is re-armable only by editing the
-- announcement (updated_at moves past emailed_at).
create or replace function public.claim_announcement_email(a_id uuid)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  rows_updated bigint;
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;
  update public.announcements
  set emailed_at = now()
  where id = a_id
    and status = 'published'
    and (emailed_at is null or updated_at > emailed_at);
  get diagnostics rows_updated = row_count;
  return rows_updated > 0;
end;
$$;

revoke execute on function public.claim_announcement_email(uuid) from public, anon;
grant execute on function public.claim_announcement_email(uuid) to authenticated;
