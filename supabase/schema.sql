-- ============================================================================
-- DTC Club Platform — Supabase schema (v1)
-- Apply once in the Supabase SQL editor (or via MCP) on a fresh project.
-- Model: RLS is the enforcement layer; the Next.js app only reacts to what
-- Supabase allows. Sensitive reads go through SECURITY DEFINER RPCs that
-- check the caller's role internally.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------------------

create table if not exists public.committees (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'member' check (role in ('member', 'bureau', 'admin')),
  is_banned boolean not null default false,
  promo integer,
  committee_id uuid references public.committees (id) on delete set null,
  avatar_url text,
  bio text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'annonce' check (kind in ('atelier', 'annonce')),
  title text not null check (char_length(title) between 3 and 200),
  body text not null default '' check (char_length(body) <= 5000),
  event_date timestamptz,
  location text not null default '',
  is_pinned boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  description text not null default '' check (char_length(description) <= 5000),
  status text not null default 'open' check (status in ('open', 'planned', 'done', 'rejected')),
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.votes (
  idea_id uuid not null references public.ideas (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (idea_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  episode_number integer not null,
  title text not null,
  guest text not null,
  role text not null default '',
  release_date text not null default '',
  youtube_id text not null check (youtube_id ~ '^[\w-]{11}$'),
  duration text not null default '',
  synopsis text not null default '',
  takeaways text[] not null default '{}',
  sponsor text not null default 'Flex Dental',
  poster_image text not null default '',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (episode_number)
);

create table if not exists public.tedx_talks (
  id uuid primary key default gen_random_uuid(),
  extract_number integer not null unique,
  speaker text not null,
  topic text not null,
  language text not null default 'FR' check (language in ('FR', 'EN', 'AR')),
  video_url text not null default '',
  poster_url text not null default '',
  instagram_url text not null default '',
  duration text not null default '',
  description text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  tagline text not null default '',
  hero_poster text not null default '',
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_page_items (
  id uuid primary key default gen_random_uuid(),
  event_page_id uuid not null references public.event_pages (id) on delete cascade,
  title text not null,
  speaker text not null default '',
  description text not null default '',
  video_url text not null default '',
  poster_url text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.mandates (
  id uuid primary key default gen_random_uuid(),
  year_label text not null unique,
  is_current boolean not null default false,
  infographic_url text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.mandate_members (
  id uuid primary key default gen_random_uuid(),
  mandate_id uuid not null references public.mandates (id) on delete cascade,
  name text not null,
  role text not null,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  unique (mandate_id, name)
);

create table if not exists public.about_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  sort_order integer not null default 0,
  title text not null,
  body text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_announcements_status_date on public.announcements (status, event_date desc);
create index if not exists idx_rsvps_announcement on public.rsvps (announcement_id);
create index if not exists idx_votes_idea on public.votes (idea_id);
create index if not exists idx_comments_idea on public.comments (idea_id, created_at);
create index if not exists idx_profiles_committee on public.profiles (committee_id);
create index if not exists idx_event_page_items_page on public.event_page_items (event_page_id, sort);

-- ----------------------------------------------------------------------------
-- HELPER FUNCTIONS (role checks, triggers)
-- ----------------------------------------------------------------------------

-- Role checks read `profiles` with owner privileges so RLS/grants on the
-- caller do not affect them (safe: they return a boolean only).
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.is_banned = false
  );
$$;

create or replace function public.is_bureau_or_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('bureau', 'admin')
      and p.is_banned = false
  );
$$;

-- Active member = signed in and not banned; gates every interactive write.
create or replace function public.is_active_member()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_banned = false
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Auto-create a profile on signup; keep email in sync with auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.handle_user_email_update()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = coalesce(new.email, '') where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_email_update();

do $$
declare t text;
begin
  foreach t in array array[
    'announcements', 'ideas', 'podcast_episodes', 'tedx_talks',
    'event_pages', 'about_sections', 'mandates'
  ]
  loop
    execute format('drop trigger if exists touch_updated_at on public.%I', t);
    execute format(
      'create trigger touch_updated_at before update on public.%I
       for each row execute procedure public.set_updated_at()', t);
  end loop;
end;
$$;

-- Only one current mandate: promoting one auto-archives the previous ones.
create or replace function public.enforce_single_current_mandate()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.is_current then
    update public.mandates
    set is_current = false
    where is_current and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists single_current_mandate on public.mandates;
create trigger single_current_mandate
  before insert or update on public.mandates
  for each row execute procedure public.enforce_single_current_mandate();

-- ----------------------------------------------------------------------------
-- RPCs (SECURITY DEFINER — each checks the caller's role internally)
-- ----------------------------------------------------------------------------

-- Full own profile (email/bio/phone/role are not column-granted on the table).
create or replace function public.my_profile()
returns setof public.profiles
language sql stable security definer set search_path = ''
as $$
  select * from public.profiles where id = auth.uid();
$$;

-- Annuaire: safe fields only, members-only (no contact info).
create or replace function public.member_directory()
returns table (id uuid, full_name text, avatar_url text, promo integer, committee text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;
  return query
    select p.id, p.full_name, p.avatar_url, p.promo, coalesce(c.name, '')
    from public.profiles p
    left join public.committees c on c.id = p.committee_id
    where p.is_banned = false and p.full_name <> ''
    order by p.full_name;
end;
$$;

-- Bureau view of members (adds contact info) — bureau & admin only.
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
    order by p.created_at;
end;
$$;

-- Admin view of all accounts (adds role/ban state) — admin only.
create or replace function public.admin_list_profiles()
returns table (id uuid, full_name text, email text, phone text, bio text, avatar_url text, promo integer, committee text, role text, is_banned boolean, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;
  return query
    select p.id, p.full_name, p.email, p.phone, p.bio, p.avatar_url, p.promo,
           coalesce(c.name, ''), p.role, p.is_banned, p.created_at
    from public.profiles p
    left join public.committees c on c.id = p.committee_id
    order by p.created_at;
end;
$$;

-- Admin-only role management (self-demote is refused to avoid lockouts).
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
  if new_role not in ('member', 'bureau', 'admin') then
    raise exception 'Rôle invalide : %', new_role;
  end if;
  update public.profiles set role = new_role where id = target_id;
end;
$$;

create or replace function public.admin_set_banned(target_id uuid, banned boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;
  if target_id = auth.uid() then
    raise exception 'Impossible de bannir son propre compte';
  end if;
  update public.profiles set is_banned = banned where id = target_id;
end;
$$;

-- Attendee list for an atelier — bureau & admin only.
create or replace function public.announcement_attendees(a_id uuid)
returns table (user_id uuid, full_name text, avatar_url text, promo integer)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;
  return query
    select r.user_id, p.full_name, p.avatar_url, p.promo
    from public.rsvps r
    join public.profiles p on p.id = r.user_id
    where r.announcement_id = a_id
    order by r.created_at;
end;
$$;

revoke execute on function public.my_profile() from public, anon;
revoke execute on function public.member_directory() from public, anon;
revoke execute on function public.bureau_list_profiles() from public, anon;
revoke execute on function public.admin_list_profiles() from public, anon;
revoke execute on function public.admin_set_role(uuid, text) from public, anon;
revoke execute on function public.admin_set_banned(uuid, boolean) from public, anon;
revoke execute on function public.announcement_attendees(uuid) from public, anon;

-- Trigger-only functions must never be callable via RPC (trigger invocation
-- does not require EXECUTE, so revoking is safe for the triggers themselves).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_update() from public, anon, authenticated;
revoke execute on function public.enforce_single_current_mandate() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.handle_user_email_update() to service_role;
grant execute on function public.enforce_single_current_mandate() to service_role;
grant execute on function public.my_profile() to authenticated;
grant execute on function public.member_directory() to authenticated;
grant execute on function public.bureau_list_profiles() to authenticated;
grant execute on function public.admin_list_profiles() to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_set_banned(uuid, boolean) to authenticated;
grant execute on function public.announcement_attendees(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- PUBLIC VIEWS (security_invoker: they execute with the querying role's
-- privileges, so table RLS and column grants stay the enforcement layer)
-- ----------------------------------------------------------------------------

create or replace view public.announcement_board
with (security_invoker = true) as
select
  a.id, a.kind, a.title, a.body, a.event_date, a.location, a.is_pinned,
  a.status, a.author_id, a.created_at, a.updated_at,
  p.full_name as author_name,
  (select count(*)::int from public.rsvps r where r.announcement_id = a.id) as rsvp_count
from public.announcements a
left join public.profiles p on p.id = a.author_id
where a.status = 'published';

create or replace view public.idea_board
with (security_invoker = true) as
select
  i.id, i.title, i.description, i.status, i.author_id, i.created_at, i.updated_at,
  p.full_name as author_name,
  p.avatar_url as author_avatar,
  (select count(*)::int from public.votes v where v.idea_id = i.id) as vote_count,
  (select count(*)::int from public.comments c where c.idea_id = i.id) as comment_count
from public.ideas i
left join public.profiles p on p.id = i.author_id;

create or replace view public.comment_board
with (security_invoker = true) as
select
  c.id, c.idea_id, c.author_id, c.body, c.created_at,
  p.full_name as author_name,
  p.avatar_url as author_avatar
from public.comments c
left join public.profiles p on p.id = c.author_id;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.committees enable row level security;
alter table public.announcements enable row level security;
alter table public.rsvps enable row level security;
alter table public.ideas enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;
alter table public.podcast_episodes enable row level security;
alter table public.tedx_talks enable row level security;
alter table public.event_pages enable row level security;
alter table public.event_page_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.mandates enable row level security;
alter table public.mandate_members enable row level security;
alter table public.about_sections enable row level security;

-- profiles: rows visible to signed-in members (safe columns only — see GRANTs);
-- full own row via my_profile(); contact info via bureau/admin RPCs.
create policy "profiles_member_read" on public.profiles
  for select to authenticated
  using (true);

create policy "profiles_self_update" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_delete" on public.profiles
  for delete to authenticated
  using (public.is_admin());

create policy "committees_member_read" on public.committees
  for select to authenticated
  using (true);

create policy "committees_bureau_write" on public.committees
  for all to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "announcements_public_read" on public.announcements
  for select to anon, authenticated
  using (status = 'published' or public.is_bureau_or_admin());

create policy "announcements_bureau_insert" on public.announcements
  for insert to authenticated
  with check (public.is_bureau_or_admin() and author_id = auth.uid());

create policy "announcements_bureau_update" on public.announcements
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "announcements_admin_delete" on public.announcements
  for delete to authenticated
  using (public.is_admin());

create policy "rsvps_self_read" on public.rsvps
  for select to authenticated
  using (user_id = auth.uid() or public.is_bureau_or_admin());

create policy "rsvps_self_insert" on public.rsvps
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.is_active_member()
    and exists (
      select 1 from public.announcements a
      where a.id = announcement_id and a.status = 'published'
    )
  );

create policy "rsvps_self_delete" on public.rsvps
  for delete to authenticated
  using (user_id = auth.uid());

create policy "ideas_public_read" on public.ideas
  for select to anon, authenticated
  using (true);

create policy "ideas_member_insert" on public.ideas
  for insert to authenticated
  with check (author_id = auth.uid() and public.is_active_member());

create policy "ideas_bureau_update" on public.ideas
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "ideas_bureau_delete" on public.ideas
  for delete to authenticated
  using (public.is_bureau_or_admin());

create policy "votes_public_read" on public.votes
  for select to anon, authenticated
  using (true);

create policy "votes_self_insert" on public.votes
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_member());

create policy "votes_self_delete" on public.votes
  for delete to authenticated
  using (user_id = auth.uid());

create policy "comments_public_read" on public.comments
  for select to anon, authenticated
  using (true);

create policy "comments_member_insert" on public.comments
  for insert to authenticated
  with check (author_id = auth.uid() and public.is_active_member());

create policy "comments_self_update" on public.comments
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "comments_self_or_bureau_delete" on public.comments
  for delete to authenticated
  using (author_id = auth.uid() or public.is_bureau_or_admin());

create policy "podcast_public_read" on public.podcast_episodes
  for select to anon, authenticated
  using (is_published or public.is_bureau_or_admin());

create policy "podcast_bureau_write" on public.podcast_episodes
  for all to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "tedx_public_read" on public.tedx_talks
  for select to anon, authenticated
  using (is_published or public.is_bureau_or_admin());

create policy "tedx_bureau_write" on public.tedx_talks
  for all to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "event_pages_public_read" on public.event_pages
  for select to anon, authenticated
  using (status = 'published' or public.is_bureau_or_admin());

create policy "event_pages_bureau_write" on public.event_pages
  for all to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "event_items_public_read" on public.event_page_items
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.event_pages ep
      where ep.id = event_page_id and (ep.status = 'published' or public.is_bureau_or_admin())
    )
  );

create policy "event_items_bureau_write" on public.event_page_items
  for all to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "settings_public_read" on public.site_settings
  for select to anon, authenticated
  using (true);

create policy "settings_bureau_write" on public.site_settings
  for all to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "mandates_public_read" on public.mandates
  for select to anon, authenticated
  using (true);

create policy "mandates_bureau_write" on public.mandates
  for all to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "mandate_members_public_read" on public.mandate_members
  for select to anon, authenticated
  using (true);

create policy "mandate_members_bureau_write" on public.mandate_members
  for all to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "about_public_read" on public.about_sections
  for select to anon, authenticated
  using (is_published or public.is_bureau_or_admin());

create policy "about_bureau_write" on public.about_sections
  for all to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

-- ----------------------------------------------------------------------------
-- COLUMN GRANTS — profiles carries contact info; scope table-level access to
-- the safe subset. Everything beyond it goes through the RPCs above.
-- ----------------------------------------------------------------------------

revoke all on public.profiles from anon, authenticated;
-- anon reads only the columns the public views join on (author display).
grant select (id, full_name, avatar_url) on public.profiles to anon;
grant select (id, full_name, avatar_url, promo, committee_id, created_at)
  on public.profiles to authenticated;
grant update (full_name, promo, committee_id, avatar_url, bio, phone)
  on public.profiles to authenticated;

-- ----------------------------------------------------------------------------
-- STORAGE — avatars (self-write, public-read) & club-media (bureau+ write)
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('club-media', 'club-media', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "avatars_self_write" on storage.objects;
create policy "avatars_self_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and coalesce((metadata->>'size')::bigint, 0) <= 5242880 -- 5 MB
    and coalesce(metadata->>'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

drop policy if exists "avatars_self_update" on storage.objects;
create policy "avatars_self_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_self_delete" on storage.objects;
create policy "avatars_self_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "club_media_public_read" on storage.objects;
create policy "club_media_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'club-media');

drop policy if exists "club_media_bureau_write" on storage.objects;
create policy "club_media_bureau_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'club-media'
    and public.is_bureau_or_admin()
    and coalesce((metadata->>'size')::bigint, 0) <= 26214400 -- 25 MB
    and coalesce(metadata->>'mimetype', '') like 'image/%'
  );

drop policy if exists "club_media_bureau_update" on storage.objects;
create policy "club_media_bureau_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'club-media' and public.is_bureau_or_admin());

drop policy if exists "club_media_bureau_delete" on storage.objects;
create policy "club_media_bureau_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'club-media' and public.is_bureau_or_admin());

-- ----------------------------------------------------------------------------
-- DEFAULT SETTINGS (seed.sql completes content data)
-- ----------------------------------------------------------------------------

insert into public.site_settings (key, value) values
  ('events_visible', 'true'::jsonb),
  ('promo_years', '[2024, 2025, 2026]'::jsonb),
  ('home_stats', '[{"value":"1,500+","label":"Étudiants & Communauté"},{"value":"97+","label":"Activités & Publications"},{"value":"8","label":"Talks Vidéo TEDxFMDC"},{"value":"4+","label":"Épisodes Podcast"}]'::jsonb)
on conflict (key) do nothing;

-- ============================================================================
-- v2 (2026-08-25) — review hardening: FK indexes, RLS init-plan fix,
-- RSVP headcount cache + Realtime, gallery_images. Applied live via MCP;
-- kept here so fresh installs reach the same shape. Idempotent.
-- ============================================================================

-- Covering indexes for foreign keys ("Mes activités" queries, cascades).
create index if not exists idx_announcements_author on public.announcements (author_id);
create index if not exists idx_ideas_author on public.ideas (author_id);
create index if not exists idx_comments_author on public.comments (author_id);
create index if not exists idx_rsvps_user on public.rsvps (user_id);
create index if not exists idx_votes_user on public.votes (user_id);

-- auth.uid() wrapped as scalar subqueries (evaluated once per statement).
alter policy "profiles_self_update" on public.profiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
alter policy "announcements_bureau_insert" on public.announcements
  with check (public.is_bureau_or_admin() and author_id = (select auth.uid()));
alter policy "rsvps_self_read" on public.rsvps
  using (user_id = (select auth.uid()) or public.is_bureau_or_admin());
alter policy "rsvps_self_insert" on public.rsvps
  with check (
    user_id = (select auth.uid())
    and public.is_active_member()
    and exists (
      select 1 from public.announcements a
      where a.id = announcement_id and a.status = 'published'
    )
  );
alter policy "rsvps_self_delete" on public.rsvps
  using (user_id = (select auth.uid()));
alter policy "ideas_member_insert" on public.ideas
  with check (author_id = (select auth.uid()) and public.is_active_member());
alter policy "votes_self_insert" on public.votes
  with check (user_id = (select auth.uid()) and public.is_active_member());
alter policy "votes_self_delete" on public.votes
  using (user_id = (select auth.uid()));
alter policy "comments_member_insert" on public.comments
  with check (author_id = (select auth.uid()) and public.is_active_member());
alter policy "comments_self_update" on public.comments
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));
alter policy "comments_self_or_bureau_delete" on public.comments
  using (author_id = (select auth.uid()) or public.is_bureau_or_admin());

-- RSVP headcount cache: maintained by trigger, read by announcement_board,
-- broadcast over Realtime (clients subscribe to announcements UPDATEs).
alter table public.announcements add column if not exists rsvp_count_cache integer not null default 0;

create or replace function public.sync_announcement_rsvp_count()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  aid uuid;
begin
  aid := coalesce(new.announcement_id, old.announcement_id);
  update public.announcements a
  set rsvp_count_cache = (select count(*) from public.rsvps r where r.announcement_id = a.id)
  where a.id = aid;
  return null;
end;
$$;

drop trigger if exists on_rsvp_change on public.rsvps;
create trigger on_rsvp_change
  after insert or delete on public.rsvps
  for each row execute procedure public.sync_announcement_rsvp_count();

revoke execute on function public.sync_announcement_rsvp_count() from public, anon, authenticated;

create or replace view public.announcement_board
with (security_invoker = true) as
select
  a.id, a.kind, a.title, a.body, a.event_date, a.location, a.is_pinned,
  a.status, a.author_id, a.created_at, a.updated_at,
  p.full_name as author_name,
  a.rsvp_count_cache as rsvp_count
from public.announcements a
left join public.profiles p on p.id = a.author_id
where a.status = 'published';

-- Realtime broadcast of public content (RLS still filters delivery).
do $$ begin
  alter publication supabase_realtime add table public.announcements;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.ideas;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.votes;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null; end $$;

-- Gallery (curated from the /admin console).
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  category text not null default 'team' check (category in ('tedx', 'podcast', 'debates', 'team', 'awards')),
  category_label text not null default '',
  image_url text not null,
  description text not null default '',
  date_label text not null default '',
  sort integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gallery_images enable row level security;

create policy "gallery_public_read" on public.gallery_images
  for select to anon, authenticated
  using (is_published or public.is_bureau_or_admin());

create policy "gallery_bureau_write" on public.gallery_images
  for all to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

drop trigger if exists touch_updated_at on public.gallery_images;
create trigger touch_updated_at before update on public.gallery_images
  for each row execute procedure public.set_updated_at();

-- v2.1 (2026-08-25, soir) — announcement posters.
alter table public.announcements add column if not exists poster_url text not null default '';
create or replace view public.announcement_board
with (security_invoker = true) as
select
  a.id, a.kind, a.title, a.body, a.event_date, a.location, a.is_pinned,
  a.status, a.author_id, a.created_at, a.updated_at,
  p.full_name as author_name,
  a.rsvp_count_cache as rsvp_count,
  a.poster_url
from public.announcements a
left join public.profiles p on p.id = a.author_id
where a.status = 'published';
