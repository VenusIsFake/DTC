-- ============================================================================
-- DTC Club Platform — Supabase schema (v1)
-- Apply once in the Supabase SQL editor (or via MCP) on a fresh project.
-- Live schema deltas are kept in supabase/migrations/ (applied via MCP);
-- this file stays the fresh-install source of truth — keep both in sync.
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
  photo_url text,
  profile_id uuid references public.profiles (id) on delete set null,
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

create policy "committees_bureau_insert" on public.committees
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "committees_bureau_update" on public.committees
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "committees_bureau_delete" on public.committees
  for delete to authenticated
  using (public.is_bureau_or_admin());

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

create policy "podcast_episodes_bureau_insert" on public.podcast_episodes
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "podcast_episodes_bureau_update" on public.podcast_episodes
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "podcast_episodes_bureau_delete" on public.podcast_episodes
  for delete to authenticated
  using (public.is_bureau_or_admin());

create policy "tedx_public_read" on public.tedx_talks
  for select to anon, authenticated
  using (is_published or public.is_bureau_or_admin());

create policy "tedx_talks_bureau_insert" on public.tedx_talks
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "tedx_talks_bureau_update" on public.tedx_talks
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "tedx_talks_bureau_delete" on public.tedx_talks
  for delete to authenticated
  using (public.is_bureau_or_admin());

create policy "event_pages_public_read" on public.event_pages
  for select to anon, authenticated
  using (status = 'published' or public.is_bureau_or_admin());

create policy "event_pages_bureau_insert" on public.event_pages
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "event_pages_bureau_update" on public.event_pages
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "event_pages_bureau_delete" on public.event_pages
  for delete to authenticated
  using (public.is_bureau_or_admin());

create policy "event_items_public_read" on public.event_page_items
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.event_pages ep
      where ep.id = event_page_id and (ep.status = 'published' or public.is_bureau_or_admin())
    )
  );

create policy "event_page_items_bureau_insert" on public.event_page_items
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "event_page_items_bureau_update" on public.event_page_items
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "event_page_items_bureau_delete" on public.event_page_items
  for delete to authenticated
  using (public.is_bureau_or_admin());

create policy "settings_public_read" on public.site_settings
  for select to anon, authenticated
  using (true);

create policy "site_settings_bureau_insert" on public.site_settings
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "site_settings_bureau_update" on public.site_settings
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "site_settings_bureau_delete" on public.site_settings
  for delete to authenticated
  using (public.is_bureau_or_admin());

create policy "mandates_public_read" on public.mandates
  for select to anon, authenticated
  using (true);

create policy "mandates_bureau_insert" on public.mandates
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "mandates_bureau_update" on public.mandates
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "mandates_bureau_delete" on public.mandates
  for delete to authenticated
  using (public.is_bureau_or_admin());

create policy "mandate_members_public_read" on public.mandate_members
  for select to anon, authenticated
  using (true);

create policy "mandate_members_bureau_insert" on public.mandate_members
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "mandate_members_bureau_update" on public.mandate_members
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "mandate_members_bureau_delete" on public.mandate_members
  for delete to authenticated
  using (public.is_bureau_or_admin());

create policy "about_public_read" on public.about_sections
  for select to anon, authenticated
  using (is_published or public.is_bureau_or_admin());

create policy "about_sections_bureau_insert" on public.about_sections
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "about_sections_bureau_update" on public.about_sections
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "about_sections_bureau_delete" on public.about_sections
  for delete to authenticated
  using (public.is_bureau_or_admin());

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
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and coalesce((metadata->>'size')::bigint, 0) <= 5242880 -- 5 MB
    and coalesce(metadata->>'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

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
    and (select public.is_bureau_or_admin())
    and coalesce((metadata->>'size')::bigint, 0) <= 26214400 -- 25 MB
    and coalesce(metadata->>'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

drop policy if exists "club_media_bureau_update" on storage.objects;
create policy "club_media_bureau_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'club-media' and (select public.is_bureau_or_admin()))
  with check (
    bucket_id = 'club-media'
    and (select public.is_bureau_or_admin())
    and coalesce((metadata->>'size')::bigint, 0) <= 26214400 -- 25 MB
    and coalesce(metadata->>'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

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
  ('site_wall_open', 'false'::jsonb),
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

create policy "gallery_images_bureau_insert" on public.gallery_images
  for insert to authenticated
  with check (public.is_bureau_or_admin());

create policy "gallery_images_bureau_update" on public.gallery_images
  for update to authenticated
  using (public.is_bureau_or_admin())
  with check (public.is_bureau_or_admin());

create policy "gallery_images_bureau_delete" on public.gallery_images
  for delete to authenticated
  using (public.is_bureau_or_admin());

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

-- ============================================================================
-- v2.2 (2026-08-31) — mandate member photos + profile linking (see
-- supabase/migrations/20260831_mandate_members_photo_profile.sql).
-- ============================================================================

alter table public.mandate_members add column if not exists photo_url text;
alter table public.mandate_members add column if not exists profile_id uuid
  references public.profiles (id) on delete set null;

create index if not exists idx_mandate_members_profile on public.mandate_members (profile_id);

-- ============================================================================
-- v2.3 (2026-09-01) — bureau recruitment campaigns (see
-- supabase/migrations/20260901_recruitment_applications.sql). Applications
-- carry names/phones → bureau-only reads; inserts allowed for everyone
-- while a campaign is open.
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

create policy "applications_bureau_read" on public.applications
  for select to authenticated
  using (public.is_bureau_or_admin());

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

-- ============================================================================
-- v2.4 (2026-09-01, soir) — pre-launch security hardening (see
-- supabase/migrations/20260901_security_hardening.sql for the full rationale).
-- Role helpers (is_admin etc.) STAY anon-executable: anon-readable policies
-- call them and policy expressions run with the caller's privileges.
-- ============================================================================

alter table public.announcements add column if not exists emailed_at timestamptz;

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

-- Two-layer privesc defense: column grants AND the policy itself pin
-- role/is_banned/email on self-updates. (ALTER POLICY cannot re-scope FOR/TO;
-- the policy already targets UPDATE to authenticated.)
alter policy "profiles_self_update" on public.profiles
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role is not distinct from public.self_role()
    and is_banned is not distinct from public.self_is_banned()
    and email is not distinct from public.self_email()
  );

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

create or replace function public.guard_application_submit()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- anon/authenticated hold INSERT grants on created_at (PostgREST inserts
  -- set it column-wise); a forged past timestamp would dodge the flood cap.
  new.created_at := now();
  if exists (
    select 1 from public.applications a
    where a.recruitment_id = new.recruitment_id
      and lower(a.full_name) = lower(new.full_name)
      and a.phone = new.phone
  ) then
    raise exception 'Une candidature avec ce nom et ce téléphone existe déjà pour cet appel.';
  end if;
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

create index if not exists idx_applications_profile
  on public.applications (profile_id);

-- Atomic emailed_at claim: true = this caller may send the broadcast.
-- Re-armable only by editing the announcement (updated_at > emailed_at).
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

create unique index if not exists applications_one_per_identity
  on public.applications (recruitment_id, lower(full_name), phone);

drop policy if exists "club_media_bureau_write" on storage.objects;
create policy "club_media_bureau_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'club-media'
    and public.is_bureau_or_admin()
    and coalesce((metadata->>'size')::bigint, 0) <= 26214400 -- 25 MB
    and coalesce(metadata->>'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  );

-- Vote counts stay public (idea_board), attribution (user_id) does not.
revoke select on public.votes from anon;
grant select (idea_id, created_at) on public.votes to anon;

-- Author names for logged-out visitors (column grants scope anon reads to
-- id/full_name/avatar_url — no contact info).
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles
  for select to anon
  using (true);

-- ============================================================================
-- v2.4.1 (2026-09-01, soir) — emailed_at stamp fix. The shared
-- touch_updated_at trigger bumped updated_at after the broadcast route
-- stamped emailed_at, so updated_at always stayed ahead and the re-send
-- guard never fired. announcements now uses a dedicated trigger that skips
-- the bump when ONLY emailed_at changed (content edits still bump).
-- ============================================================================

create or replace function public.set_updated_at_announcements()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new is distinct from old and new.emailed_at is not distinct from old.emailed_at then
    new.updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists touch_updated_at on public.announcements;
create trigger touch_updated_at
  before update on public.announcements
  for each row execute procedure public.set_updated_at_announcements();

revoke execute on function public.set_updated_at_announcements() from public, anon, authenticated;

-- ============================================================================
-- v2.5 (2026-09-01, nuit) — wall hides DATA too, not just pages (see
-- supabase/migrations/20260901_wall_content_lock.sql). While site_wall_open
-- is not true, anonymous REST reads of public content return nothing;
-- flipping the console toggle opens pages and data together. site_settings
-- and recruitments/positions stay readable (middleware reads the wall key as
-- anon; /candidature is the public exempt page). site_is_open() is
-- PUBLIC-executable by design — anon-side policies call it (accepted WARN).
-- ============================================================================

create or replace function public.site_is_open()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select true from public.site_settings s
      where s.key = 'site_wall_open' and s.value = 'true'::jsonb),
    false
  )
$$;

alter policy "announcements_public_read" on public.announcements
  using (((select public.site_is_open()) and status = 'published') or public.is_bureau_or_admin());

alter policy "ideas_public_read" on public.ideas
  using ((select public.site_is_open()));

alter policy "votes_public_read" on public.votes
  using ((select public.site_is_open()));

alter policy "comments_public_read" on public.comments
  using ((select public.site_is_open()));

alter policy "podcast_public_read" on public.podcast_episodes
  using (((select public.site_is_open()) and is_published) or public.is_bureau_or_admin());

alter policy "tedx_public_read" on public.tedx_talks
  using (((select public.site_is_open()) and is_published) or public.is_bureau_or_admin());

alter policy "event_pages_public_read" on public.event_pages
  using (((select public.site_is_open()) and status = 'published') or public.is_bureau_or_admin());

alter policy "event_items_public_read" on public.event_page_items
  using (
    public.is_bureau_or_admin()
    or (
      (select public.site_is_open())
      and exists (
        select 1 from public.event_pages ep
        where ep.id = event_page_id and ep.status = 'published'
      )
    )
  );

alter policy "mandates_public_read" on public.mandates
  using ((select public.site_is_open()));

alter policy "mandate_members_public_read" on public.mandate_members
  using ((select public.site_is_open()));

alter policy "gallery_public_read" on public.gallery_images
  using (((select public.site_is_open()) and is_published) or public.is_bureau_or_admin());

alter policy "about_public_read" on public.about_sections
  using (((select public.site_is_open()) and is_published) or public.is_bureau_or_admin());

alter policy "profiles_public_read" on public.profiles
  using ((select public.site_is_open()));
