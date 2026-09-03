-- ============================================================================
-- v2.8 (2026-09-03) — streamlined membership funnel (Venus request) + invite
-- link hotfix.
--
-- Funnel: a fresh guest on /espace is invited to become a member: they fill
-- their profile (name/promo/phone/bio), submit it (membership_status goes
-- 'pending'), and the payment panel unlocks — console-configured fee, bank
-- details, meet-the-bureau instructions and a WhatsApp contact button. The
-- bureau still flips the final switch (approve_guest) once payment is sorted;
-- approval now also stamps membership_status='member'.
--
-- Hotfix: create_invite_link crashed with "function gen_random_bytes(integer)
-- does not exist" — pgcrypto lives in the `extensions` schema and the RPC's
-- empty search_path cannot resolve it. Tokens are now derived from two
-- gen_random_uuid() calls (core pg_catalog, always resolvable, same 64-hex
-- token shape and ≥240 bits of entropy).
-- ============================================================================

-- 1. Invite link hotfix -------------------------------------------------------
create or replace function public.create_invite_link(new_role text default 'bureau')
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  caller_role text;
  fresh_token text;
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;
  if new_role not in ('member', 'bureau', 'admin') then
    raise exception 'Rôle invalide : %', new_role;
  end if;
  caller_role := public.self_role();
  if new_role = 'admin' and caller_role <> 'admin' then
    raise exception 'Seul un administrateur peut créer un lien admin';
  end if;
  fresh_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.invite_links (token, role, created_by)
  values (fresh_token, new_role, auth.uid());
  return fresh_token;
end;
$$;
revoke execute on function public.create_invite_link(text) from public, anon;
grant execute on function public.create_invite_link(text) to authenticated;

-- 2. Funnel state on profiles ---------------------------------------------------
alter table public.profiles
  add column if not exists membership_status text not null default 'none';
alter table public.profiles drop constraint if exists profiles_membership_status_check;
alter table public.profiles
  add constraint profiles_membership_status_check
  check (membership_status in ('none', 'pending', 'member'));

-- 3. Guest submits (or resubmits) their membership form --------------------------
-- Validates server-side and writes the profile fields + status in one shot.
-- Guest self-service only: members already have access, bureau/admin neither.
create or replace function public.submit_membership_request(
  p_full_name text,
  p_promo integer,
  p_phone text,
  p_bio text default ''
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  me public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;
  if public.self_is_banned() then
    raise exception 'Compte suspendu';
  end if;
  select * into me from public.profiles where id = auth.uid();
  if me.id is null then
    raise exception 'Profil introuvable';
  end if;
  if me.role <> 'guest' then
    raise exception 'Votre compte a déjà accès à l''espace membre';
  end if;
  if char_length(btrim(p_full_name)) not between 2 and 120 then
    raise exception 'Nom complet requis (2 à 120 caractères)';
  end if;
  if p_promo is null or p_promo not between 2000 and 2100 then
    raise exception 'Année (promo) requise';
  end if;
  if p_phone is null or p_phone !~ '^\+?[0-9][0-9 .-]{6,29}$' then
    raise exception 'Numéro de téléphone invalide';
  end if;
  if char_length(coalesce(p_bio, '')) > 1000 then
    raise exception 'Bio trop longue (1000 caractères maximum)';
  end if;

  update public.profiles set
    full_name = btrim(p_full_name),
    promo = p_promo,
    phone = btrim(p_phone),
    bio = coalesce(p_bio, ''),
    membership_status = 'pending'
  where id = auth.uid()
    -- Guard re-checks the role at write time: a concurrent bureau approval
    -- (or admin demote/promote) can never be stamped back to 'pending'.
    and role = 'guest';
end;
$$;
revoke execute on function public.submit_membership_request(text, integer, text, text) from public, anon;
grant execute on function public.submit_membership_request(text, integer, text, text) to authenticated;

-- The reverse hop stays a separate tiny RPC so a pending guest can retract
-- their form themselves (back to 'none') without bureau intervention.
create or replace function public.cancel_membership_request()
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.profiles p
  set membership_status = 'none'
  where p.id = auth.uid()
    and p.role = 'guest'
    and p.is_banned = false
    and p.membership_status = 'pending';
end;
$$;
revoke execute on function public.cancel_membership_request() from public, anon;
grant execute on function public.cancel_membership_request() to authenticated;

-- 4. Approval stamps the funnel status too ---------------------------------------
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
    update public.profiles set role = 'member', membership_status = 'member' where id = target_id;
  else
    delete from auth.users where id = target_id;
  end if;
end;
$$;
revoke execute on function public.approve_guest(uuid, boolean) from public, anon;
grant execute on function public.approve_guest(uuid, boolean) to authenticated;

-- 5. Console views expose the funnel state ----------------------------------------
drop function if exists public.bureau_list_profiles();
create function public.bureau_list_profiles()
returns table (id uuid, full_name text, email text, phone text, bio text, avatar_url text, promo integer, committee text, role text, is_banned boolean, membership_status text, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;
  return query
    select p.id, p.full_name, p.email, p.phone, p.bio, p.avatar_url, p.promo,
           coalesce(c.name, ''), p.role, p.is_banned, p.membership_status, p.created_at
    from public.profiles p
    left join public.committees c on c.id = p.committee_id
    order by p.created_at;
end;
$$;
revoke execute on function public.bureau_list_profiles() from public, anon;
grant execute on function public.bureau_list_profiles() to authenticated;

drop function if exists public.admin_list_profiles();
create function public.admin_list_profiles()
returns table (id uuid, full_name text, email text, phone text, bio text, avatar_url text, promo integer, committee text, role text, is_banned boolean, membership_status text, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;
  return query
    select p.id, p.full_name, p.email, p.phone, p.bio, p.avatar_url, p.promo,
           coalesce(c.name, ''), p.role, p.is_banned, p.membership_status, p.created_at
    from public.profiles p
    left join public.committees c on c.id = p.committee_id
    order by p.created_at;
end;
$$;
revoke execute on function public.admin_list_profiles() from public, anon;
grant execute on function public.admin_list_profiles() to authenticated;
