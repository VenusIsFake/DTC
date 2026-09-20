-- ============================================================================
-- Migration: 20260920_stand_and_member_qr.sql
-- 1. Multi-use invite links (reusable QR code for members)
-- 2. Returning members whitelist (67 WhatsApp members -> 80 DH discount)
-- 3. Dual bank account support (Compte 1 & Compte 2)
-- 4. Initial seed for announcement and ideas
-- ============================================================================

-- 1. Multi-use invite links
alter table public.invite_links add column if not exists is_multi_use boolean not null default false;
alter table public.invite_links add column if not exists uses_count integer not null default 0;

-- Drop single-argument overload to avoid PostgREST ambiguity
drop function if exists public.create_invite_link(text);

create or replace function public.create_invite_link(new_role text default 'bureau', p_multi_use boolean default false)
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
  fresh_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.invite_links (token, role, created_by, is_multi_use, expires_at)
  values (
    fresh_token,
    new_role,
    auth.uid(),
    coalesce(p_multi_use, false),
    case when coalesce(p_multi_use, false) then now() + interval '365 days' else now() + interval '30 days' end
  );
  return fresh_token;
end;
$$;
revoke execute on function public.create_invite_link(text, boolean) from public, anon;
grant execute on function public.create_invite_link(text, boolean) to authenticated;

-- Public status check
create or replace function public.invite_link_status(p_token text)
returns text
language sql stable security definer set search_path = ''
as $$
  select coalesce((
    select case
      when not l.is_multi_use and l.used_at is not null then 'used'
      when l.expires_at < now() then 'expired'
      else 'ok:' || l.role
    end
    from public.invite_links l
    where l.token = p_token
  ), 'invalid')
$$;
revoke execute on function public.invite_link_status(text) from public;
grant execute on function public.invite_link_status(text) to anon, authenticated;

-- Redemption
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
  if not link.is_multi_use and link.used_at is not null then
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

  update public.invite_links
  set uses_count = uses_count + 1,
      used_at = case when link.is_multi_use then coalesce(link.used_at, now()) else now() end,
      used_by = case when link.is_multi_use then coalesce(link.used_by, auth.uid()) else auth.uid() end
  where id = link.id;

  if rows_updated = 0 then
    return 'already';
  end if;
  return link.role;
end;
$$;
revoke execute on function public.redeem_invite_link(text) from public, anon;
grant execute on function public.redeem_invite_link(text) to authenticated;

-- Get or auto-create persistent member QR link
create or replace function public.get_or_create_member_qr_link()
returns table (id uuid, token text, uses_count int, created_at timestamptz, expires_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare
  active_row public.invite_links%rowtype;
  new_token text;
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;

  select l.* into active_row
  from public.invite_links l
  where l.role = 'member' and l.is_multi_use = true and l.expires_at > now()
  order by l.created_at desc
  limit 1;

  if active_row.id is not null then
    return query select active_row.id, active_row.token, active_row.uses_count, active_row.created_at, active_row.expires_at;
    return;
  end if;

  new_token := public.create_invite_link('member', true);
  return query
    select l.id, l.token, l.uses_count, l.created_at, l.expires_at
    from public.invite_links l
    where l.token = new_token;
end;
$$;
revoke execute on function public.get_or_create_member_qr_link() from public, anon;
grant execute on function public.get_or_create_member_qr_link() to authenticated;

-- Rotate member QR link (atomic revocation of old + creation of fresh)
create or replace function public.rotate_member_qr_link()
returns table (id uuid, token text, uses_count int, created_at timestamptz, expires_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare
  new_token text;
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;

  update public.invite_links l
  set expires_at = now()
  where l.role = 'member' and l.is_multi_use = true and l.expires_at > now();

  new_token := public.create_invite_link('member', true);
  return query
    select l.id, l.token, l.uses_count, l.created_at, l.expires_at
    from public.invite_links l
    where l.token = new_token;
end;
$$;
revoke execute on function public.rotate_member_qr_link() from public, anon;
grant execute on function public.rotate_member_qr_link() to authenticated;

-- 2. Returning members whitelist (67 WhatsApp members -> 80 DH discount)
create table if not exists public.returning_members_whitelist (
  phone_normalized text primary key,
  source text not null default 'whatsapp_26_27',
  discount_fee integer not null default 80,
  standard_fee integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.returning_members_whitelist enable row level security;

-- Whitelist lookup RPC (phone normalization: digits only, 06/07 -> 2126/2127)
create or replace function public.check_returning_member(p_phone text)
returns json
language plpgsql stable security definer set search_path = ''
as $$
declare
  clean text;
  found_row public.returning_members_whitelist%rowtype;
begin
  clean := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if clean ~ '^0[67]' then
    clean := '212' || substring(clean from 2);
  elsif clean ~ '^[67]' and length(clean) = 9 then
    clean := '212' || clean;
  end if;

  select * into found_row
  from public.returning_members_whitelist
  where phone_normalized = clean;

  if found_row.phone_normalized is not null then
    return json_build_object(
      'is_returning', true,
      'fee_amount', found_row.discount_fee,
      'standard_fee', found_row.standard_fee,
      'discount_label', '80 DH / an (Ancien Membre)'
    );
  else
    return json_build_object(
      'is_returning', false,
      'fee_amount', 100,
      'standard_fee', 100,
      'discount_label', '100 DH / an'
    );
  end if;
end;
$$;
revoke execute on function public.check_returning_member(text) from public;
grant execute on function public.check_returning_member(text) to anon, authenticated;

-- Populate 67 numbers
insert into public.returning_members_whitelist (phone_normalized) values
  ('212689928004'), ('212666908289'), ('212694984475'), ('212700260798'),
  ('212637165370'), ('212702023799'), ('212623807067'), ('212616066174'),
  ('212634086642'), ('212610072628'), ('212654839435'), ('212637877444'),
  ('212693338443'), ('212634188544'), ('212690601725'), ('212627645877'),
  ('212635679138'), ('212605666821'), ('212678208929'), ('212611608822'),
  ('138315344920801'), ('212681516399'), ('212693191701'), ('212653421116'),
  ('212689616315'), ('212667570487'), ('212628120962'), ('212644767426'),
  ('212631227411'), ('212624254135'), ('212613384345'), ('191044591337589'),
  ('255851268972566'), ('212646853586'), ('212674304774'), ('212601238821'),
  ('212657950008'), ('212645335422'), ('212624266746'), ('212602175039'),
  ('212707009838'), ('212693598249'), ('212694807882'), ('212770996355'),
  ('212626667414'), ('212620054740'), ('212619817894'), ('212681988287'),
  ('212635836489'), ('212699125866'), ('212671081312'), ('212679794369'),
  ('212634686892'), ('212621609431'), ('212723954980'), ('212601441985'),
  ('212610788295'), ('212672442738'), ('212709727698'), ('212680246913'),
  ('212663898304'), ('212614691506'), ('212615044014'), ('212615042104'),
  ('212652435248'), ('100914669048036'), ('212635321003')
on conflict (phone_normalized) do nothing;

-- 3. Dual Bank Details seed
insert into public.site_settings (key, value)
values ('membership_bank_details_2', '"RIB : 230 780 6065299211021800 68\nTitulaire : NEAMA LABZAI\nBanque : CIH Bank (Casa Mly Abdellah)\nIBAN : MA64 2307 8060 6529 9211 0218 0068"')
on conflict (key) do nothing;
