-- ============================================================================
-- v2.5 (2026-09-01, nuit) — wall hides DATA too, not just pages (Venus:
-- pre-launch = bureau-only access, full stop). While site_wall_open is not
-- true, anonymous REST reads of public content return nothing; the RLS layer
-- matches the middleware page wall. Flipping the console toggle opens both
-- at once. site_settings and recruitments/positions stay readable: the
-- middleware itself reads site_wall_open as anon (locking it would deadlock
-- the wall) and /candidature is the public exempt page.
-- NOTE: site_is_open() is PUBLIC-executable by design, same class as
-- is_admin() — anon-side policies call it (advisors will warn; accepted).
-- Scalar subquery form (select public.site_is_open()) = init-plan, one
-- evaluation per statement, not per row.
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

-- announcements: published-for-public only while open (bureau unaffected).
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

-- Member names/avatars hidden from anon while walled (authenticated members
-- keep profiles_member_read).
alter policy "profiles_public_read" on public.profiles
  using ((select public.site_is_open()));
