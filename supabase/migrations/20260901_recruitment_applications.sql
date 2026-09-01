-- ============================================================================
-- 2026-09-01 — Bureau recruitment campaigns (in-site candidature form).
-- Replaces the Google Form: the bureau opens a campaign from the console
-- (title + intro + open positions), members apply on /candidature, and the
-- console lists/labels/deletes the submitted applications (PII: names &
-- phones → bureau-only reads).
-- ============================================================================

create table if not exists public.recruitments (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  intro text not null default '' check (char_length(intro) <= 5000),
  is_open boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recruitment_positions (
  id uuid primary key default gen_random_uuid(),
  recruitment_id uuid not null references public.recruitments (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  recruitment_id uuid not null references public.recruitments (id) on delete cascade,
  position_id uuid references public.recruitment_positions (id) on delete set null,
  full_name text not null check (char_length(full_name) between 3 and 120),
  study_year text not null check (study_year in ('1A', '2A', '3A', '4A', '5A', '6A')),
  phone text not null check (char_length(phone) between 6 and 40),
  had_responsibility boolean not null default false,
  motivation text not null check (char_length(motivation) between 10 and 5000),
  why_you text not null check (char_length(why_you) between 10 and 5000),
  profile_id uuid references public.profiles (id) on delete set null default auth.uid(),
  status text not null default 'new' check (status in ('new', 'reviewed', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_recruitment_positions_campaign
  on public.recruitment_positions (recruitment_id, sort);
create index if not exists idx_applications_campaign
  on public.applications (recruitment_id, created_at desc);
create index if not exists idx_applications_position on public.applications (position_id);

alter table public.recruitments enable row level security;
alter table public.recruitment_positions enable row level security;
alter table public.applications enable row level security;

-- Only one campaign may be open at a time (mirrors single_current_mandate).
create or replace function public.enforce_single_open_recruitment()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.is_open then
    update public.recruitments
    set is_open = false
    where is_open and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists single_open_recruitment on public.recruitments;
create trigger single_open_recruitment
  before insert or update on public.recruitments
  for each row execute procedure public.enforce_single_open_recruitment();

drop trigger if exists touch_updated_at on public.recruitments;
create trigger touch_updated_at before update on public.recruitments
  for each row execute procedure public.set_updated_at();

create policy "recruitments_public_read" on public.recruitments
  for select to anon, authenticated
  using (is_open or public.is_bureau_or_admin());

create policy "recruitments_bureau_insert" on public.recruitments
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "recruitments_bureau_update" on public.recruitments
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "recruitments_bureau_delete" on public.recruitments
  for delete to authenticated
  using (public.is_bureau_or_admin());

create policy "positions_public_read" on public.recruitment_positions
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.recruitments r
      where r.id = recruitment_id and (r.is_open or public.is_bureau_or_admin())
    )
  );

create policy "positions_bureau_insert" on public.recruitment_positions
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "positions_bureau_update" on public.recruitment_positions
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "positions_bureau_delete" on public.recruitment_positions
  for delete to authenticated
  using (public.is_bureau_or_admin());

-- Applications carry names/phones: bureau-only reads, no public listing.
create policy "applications_bureau_read" on public.applications
  for select to authenticated
  using (public.is_bureau_or_admin());

-- Anyone (signed in or not) may apply, but only while the campaign is open
-- and only for a position that belongs to that campaign.
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
  );

create policy "applications_bureau_update" on public.applications
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "applications_bureau_delete" on public.applications
  for delete to authenticated
  using (public.is_bureau_or_admin());

revoke execute on function public.enforce_single_open_recruitment()
  from public, anon, authenticated;

-- Seed the live 2026-2027 campaign (content from the Google Form it
-- replaces) — only on a fresh install / empty table.
do $$
declare campaign_id uuid;
begin
  if exists (select 1 from public.recruitments) then
    return;
  end if;
  insert into public.recruitments (title, intro, is_open)
  values (
    'Appel à candidatures — Bureau DENTALK 2026-2027',
    'Chers membres du Dentalk Club,' || chr(10) || chr(10) ||
    'Dans le cadre du renouvellement du bureau du club, nous lançons officiellement ' ||
    'un appel à candidatures pour les membres souhaitant s''impliquer activement dans ' ||
    'le développement du club et contribuer à son rayonnement.' || chr(10) || chr(10) ||
    'Si vous êtes passionné(e) par la prise de parole, motivé(e) à travailler en équipe ' ||
    'et désireux(se) de participer à l''organisation des activités du club, nous vous ' ||
    'invitons à soumettre votre candidature pour intégrer le nouveau bureau du Dentalk Club.' || chr(10) || chr(10) ||
    'Nous encourageons vivement tous les membres motivés à se présenter et à proposer ' ||
    'leurs idées pour faire évoluer le club.',
    true
  )
  returning id into campaign_id;
  insert into public.recruitment_positions (recruitment_id, title, description, sort)
  values (campaign_id, 'Secrétaire général(e)', '', 1);
end;
$$;
