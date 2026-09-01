-- ============================================================================
-- v2.4 (2026-09-01, soir) — pre-launch security hardening (full audit pass).
--  1. applications: anonymous inserts were unbounded (spam flood) and could
--     forge profile_id / status; now constrained, de-duplicated and
--     flood-capped at the DB level.
--  2. profiles self-update: role/is_banned/email were protected only by
--     column grants (single layer); WITH CHECK now pins them too.
--  3. bureau_list_profiles skips banned members (email broadcast recipients);
--     member_directory refuses banned callers.
--  4. club-media storage policy no longer accepts image/svg+xml (hosted
--     script vector) — explicit mime list, same as avatars.
--  5. votes: anon keeps vote counts (idea_board) but loses the user_id
--     column (vote attribution harvest); Realtime delivery follows the same
--     privileges.
--  6. profiles: anon SELECT policy so public views display author names
--     (column grants already scope anon to id/full_name/avatar_url).
--  7. announcements.emailed_at: broadcast send marker for route-level
--     idempotency (re-send only after the announcement is edited again).
-- NOTE: is_admin / is_bureau_or_admin / is_active_member stay executable by
-- anon ON PURPOSE — policies on anon-readable tables call them and policy
-- expressions run with the caller's privileges; revoking would break every
-- anonymous read (advisors flag this; the warning is accepted).
-- ============================================================================

-- 7. Broadcast send marker ---------------------------------------------------
alter table public.announcements add column if not exists emailed_at timestamptz;

-- 2. Helpers so the profiles policy can read the caller's current
--    role/ban/email (not column-granted) without RLS recursion --------------
create or replace function public.self_role()
returns text
language sql stable security definer set search_path = ''
as $$ select p.role from public.profiles p where p.id = auth.uid() $$;

create or replace function public.self_is_banned()
returns boolean
language sql stable security definer set search_path = ''
as $$ select p.is_banned from public.profiles p where p.id = auth.uid() $$;

create or replace function public.self_email()
returns text
language sql stable security definer set search_path = ''
as $$ select p.email from public.profiles p where p.id = auth.uid() $$;

revoke execute on function public.self_role() from public, anon;
revoke execute on function public.self_is_banned() from public, anon;
revoke execute on function public.self_email() from public, anon;
grant execute on function public.self_role() to authenticated;
grant execute on function public.self_is_banned() to authenticated;
grant execute on function public.self_email() to authenticated;

alter policy "profiles_self_update" on public.profiles
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role is not distinct from public.self_role()
    and is_banned is not distinct from public.self_is_banned()
    and email is not distinct from public.self_email()
  );

-- 3. Banned members: out of broadcast recipients, out of the annuaire -------
create or replace function public.bureau_list_profiles()
returns table (id uuid, full_name text, email text, phone text, bio text, avatar_url text, promo integer, committee text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;
  return query
  select p.id, p.full_name, p.email, p.phone, p.bio, p.avatar_url, p.promo, coalesce(c.name, '')
  from public.profiles p
  left join public.committees c on c.id = p.committee_id
  where p.is_banned = false
  order by p.created_at;
end;
$$;

create or replace function public.member_directory()
returns table (id uuid, full_name text, avatar_url text, promo integer, committee text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;
  if exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_banned) then
    raise exception 'Compte suspendu';
  end if;
  return query
  select p.id, p.full_name, p.avatar_url, p.promo, coalesce(c.name, '')
  from public.profiles p
  left join public.committees c on c.id = p.committee_id
  where p.is_banned = false and p.full_name <> ''
  order by p.full_name;
end;
$$;

-- 1. applications: constrain profile_id/status, dedup, flood cap -----------
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
    and (profile_id is null or profile_id = auth.uid())
    and status = 'new'
  );

create or replace function public.guard_application_submit()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
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

drop trigger if exists guard_application_submit on public.applications;
create trigger guard_application_submit
  before insert on public.applications
  for each row execute procedure public.guard_application_submit();

revoke execute on function public.guard_application_submit() from public, anon, authenticated;

create unique index if not exists applications_one_per_identity
  on public.applications (recruitment_id, lower(full_name), phone);

-- 4. club-media: explicit mime whitelist (SVG excluded) ---------------------
drop policy if exists "club_media_bureau_write" on storage.objects;
create policy "club_media_bureau_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'club-media'
    and public.is_bureau_or_admin()
    and coalesce((metadata->>'size')::bigint, 0) <= 26214400 -- 25 MB
    and coalesce(metadata->>'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

-- 5. votes: counts stay public, attribution does not -------------------------
revoke select on public.votes from anon;
grant select (idea_id, created_at) on public.votes to anon;

-- 6. Author names for logged-out visitors (columns already scoped) ----------
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles
  for select to anon
  using (true);
