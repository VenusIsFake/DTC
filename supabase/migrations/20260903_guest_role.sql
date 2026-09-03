-- ============================================================================
-- v2.6.1 (2026-09-03) — self-signups land as observe-only "guest" accounts.
-- Decision (Venus): public signup stays open, but a fresh account must not
-- inherit member powers (annuaire read, ideas/votes/RSVP writes) until a
-- bureau or admin grants membership from the console.
--  1. profiles.role gains 'guest' — and becomes the DEFAULT, so the
--     handle_new_user signup trigger creates guests. The admin invite flow
--     sets the real role right after createUser, so invites are unaffected.
--  2. is_active_member() excludes guests → every member write gate
--     (ideas, votes, comments, announcement RSVPs) refuses them.
--  3. member_directory() refuses guests (annuaire = validated members).
--  4. profiles_member_read: was `using (true)` for authenticated → guests
--     now only see what the anon-tier policy already shows.
--  5. bureau_list_profiles() also returns role/is_banned/created_at so the
--     console Users tab can show pending guests to bureau members.
--  6. approve_guest(): bureau/admin promotes guest→member, or refuses =
--     deletes the account outright (profile cascades).
--  7. admin_set_role() accepts 'guest' (admin can demote to observer).
-- ============================================================================

-- 1. Role values + default ----------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('guest', 'member', 'bureau', 'admin'));
alter table public.profiles alter column role set default 'guest';

-- 2. Active member = validated + not banned -----------------------------------
create or replace function public.is_active_member()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.is_banned = false
      and p.role in ('member', 'bureau', 'admin')
  );
$$;

-- 3. Annuaire reserved to validated members -----------------------------------
create or replace function public.member_directory()
returns table (id uuid, full_name text, avatar_url text, promo integer, committee text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;
  if not public.is_active_member() then
    raise exception 'Votre compte est en attente de validation par le bureau.';
  end if;
  return query
    select p.id, p.full_name, p.avatar_url, p.promo, coalesce(c.name, '')
    from public.profiles p
    left join public.committees c on c.id = p.committee_id
    where p.is_banned = false and p.full_name <> ''
    order by p.full_name;
end;
$$;

-- 4. Member-tier profile reads exclude guests ----------------------------------
drop policy if exists "profiles_member_read" on public.profiles;
create policy "profiles_member_read" on public.profiles
  for select to authenticated
  using ((select public.is_active_member()));

-- 5. Bureau view gains role/ban/created (console guest approvals) --------------
drop function if exists public.bureau_list_profiles();
create function public.bureau_list_profiles()
returns table (id uuid, full_name text, email text, phone text, bio text, avatar_url text, promo integer, committee text, role text, is_banned boolean, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;
  return query
    select p.id, p.full_name, p.email, p.phone, p.bio, p.avatar_url, p.promo,
           coalesce(c.name, ''), p.role, p.is_banned, p.created_at
    from public.profiles p
    left join public.committees c on c.id = p.committee_id
    order by p.created_at;
end;
$$;
revoke execute on function public.bureau_list_profiles() from public, anon;
grant execute on function public.bureau_list_profiles() to authenticated;

-- 6. Guest approval (bureau or admin) ------------------------------------------
-- approve=true  → guest becomes member.
-- approve=false → account deleted (auth user + cascaded profile). The person
--                 can sign up again later; nothing is kept about them.
create or replace function public.approve_guest(target_id uuid, approve boolean default true)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  target_role text;
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;
  select p.role into target_role from public.profiles p where p.id = target_id;
  if target_role is null then
    raise exception 'Compte introuvable';
  end if;
  if target_role <> 'guest' then
    raise exception 'Ce compte n''est pas en attente de validation';
  end if;
  if approve then
    update public.profiles set role = 'member' where id = target_id;
  else
    delete from auth.users where id = target_id;
  end if;
end;
$$;
revoke execute on function public.approve_guest(uuid, boolean) from public, anon;
grant execute on function public.approve_guest(uuid, boolean) to authenticated;

-- 7. Admin may also demote someone to observer ---------------------------------
create or replace function public.admin_set_role(target_id uuid, new_role text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;
  if target_id = auth.uid() then
    raise exception 'Impossible de modifier son propre rôle';
  end if;
  if new_role not in ('guest', 'member', 'bureau', 'admin') then
    raise exception 'Rôle invalide : %', new_role;
  end if;
  update public.profiles set role = new_role where id = target_id;
end;
$$;
