-- ============================================================================
-- v2.7 (2026-09-03) — one-time invitation links (Venus request).
-- A bureau/admin mints a "special and complicated" link from the console and
-- sends it to a person. The link works even while the site wall is up:
--   /invitation/<64-hex-token>
-- The recipient creates an account (or signs in with an existing guest or
-- member account), redeems the link, and immediately holds the link's role
-- (default bureau) — the wall then lets them into the main website.
-- One-time: redemption claims the row atomically (FOR UPDATE + used_at null).
-- No direct table access for anon/authenticated — everything goes through
-- SECURITY DEFINER RPCs with internal role guards.
-- ============================================================================

create table if not exists public.invite_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  role text not null default 'bureau' check (role in ('member', 'bureau', 'admin')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days',
  used_at timestamptz,
  used_by uuid references auth.users (id) on delete set null
);

alter table public.invite_links enable row level security;
-- Deliberately NO policies: anon/authenticated never touch this table
-- directly; the RPCs below are the only door.

-- Console: mint a link. Callers may only grant a role at or below their own
-- (a bureau member cannot mint admin links). Returns the raw token; the
-- console builds the full URL.
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
  fresh_token := encode(gen_random_bytes(32), 'hex');
  insert into public.invite_links (token, role, created_by)
  values (fresh_token, new_role, auth.uid());
  return fresh_token;
end;
$$;
revoke execute on function public.create_invite_link(text) from public, anon;
grant execute on function public.create_invite_link(text) to authenticated;

-- Console: list links. Tokens are included ONLY for links the viewer could
-- mint themselves — admin-link tokens are blanked for non-admin callers so a
-- bureau member cannot hijack a pending admin invitation.
create or replace function public.list_invite_links()
returns table (id uuid, token text, role text, created_at timestamptz, expires_at timestamptz, used_at timestamptz, used_by_name text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;
  return query
    select l.id,
           case when l.role = 'admin' and not public.is_admin() then '' else l.token end,
           l.role, l.created_at, l.expires_at, l.used_at,
           coalesce(p.full_name, '')
    from public.invite_links l
    left join public.profiles p on p.id = l.used_by
    order by l.created_at desc
    limit 50;
end;
$$;
revoke execute on function public.list_invite_links() from public, anon;
grant execute on function public.list_invite_links() to authenticated;

-- Console: revoke a still-unused link (expires it immediately).
create or replace function public.revoke_invite_link(link_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;
  update public.invite_links
  set expires_at = now()
  where id = link_id and used_at is null and expires_at > now();
end;
$$;
revoke execute on function public.revoke_invite_link(uuid) from public, anon;
grant execute on function public.revoke_invite_link(uuid) to authenticated;

-- Public page (no session): is this token redeemable right now?
-- Returns 'ok:<role>', 'used', 'expired' or 'invalid'. Exposes nothing the
-- holder of the token doesn't already have. coalesce: a scalar SQL function
-- returns NULL (not 'invalid') when the subquery matches no row.
create or replace function public.invite_link_status(p_token text)
returns text
language sql stable security definer set search_path = ''
as $$
  select coalesce((
    select case
      when l.used_at is not null then 'used'
      when l.expires_at < now() then 'expired'
      else 'ok:' || l.role
    end
    from public.invite_links l
    where l.token = p_token
  ), 'invalid')
$$;
revoke execute on function public.invite_link_status(text) from public;
grant execute on function public.invite_link_status(text) to anon, authenticated;

-- Redemption: atomic one-time claim. Banned callers are refused (a ban must
-- not be liftable by a bearer link). The role upgrade applies a rank guard
-- ON the profiles row itself, so two links redeemed concurrently by the same
-- person cannot end at the lower role, and a caller with no profile row (or
-- already holding equal/better access) consumes nothing — 'already' return.
create or replace function public.redeem_invite_link(p_token text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  link public.invite_links%rowtype;
  link_rank int;
  rows_updated bigint;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;
  if public.self_is_banned() then
    raise exception 'Compte suspendu';
  end if;
  select * into link from public.invite_links where token = p_token for update;
  if link.id is null then
    raise exception 'Lien invalide';
  end if;
  if link.used_at is not null then
    raise exception 'Ce lien a déjà été utilisé';
  end if;
  if link.expires_at < now() then
    raise exception 'Ce lien a expiré';
  end if;

  link_rank := case link.role
    when 'admin' then 4 when 'bureau' then 3 else 2 end;

  update public.profiles set role = link.role
  where id = auth.uid()
    and (case coalesce(role, '') when 'admin' then 4 when 'bureau' then 3
         when 'member' then 2 else 1 end) < link_rank;
  get diagnostics rows_updated = row_count;
  if rows_updated = 0 then
    return 'already';
  end if;

  update public.invite_links
  set used_at = now(), used_by = auth.uid()
  where id = link.id;
  return link.role;
end;
$$;
revoke execute on function public.redeem_invite_link(text) from public, anon;
grant execute on function public.redeem_invite_link(text) to authenticated;
