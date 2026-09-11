-- 20260911 — Scope anonymous site_settings reads (audit 2026-09-11, P2).
--
-- "settings_public_read" let ANY caller read every settings key. Most keys
-- are rendered on public pages (hero/sponsor/stats/nav), so anon read access
-- itself is needed — but membership_* (funnel fees, payment instructions,
-- the enabled switch) must stay behind authentication.
--
-- site_wall_open stays anon-readable ON PURPOSE: middleware reads it with the
-- anon key on every request (fail-closed). Removing it there would brick the
-- wall, not protect it.
--
-- Console (bureau/admin) and /espace membership panel read as authenticated
-- users → unaffected.
--
-- Run: Supabase Dashboard → SQL Editor → paste & run. Idempotent.

drop policy if exists "settings_public_read" on public.site_settings;

create policy "settings_public_read" on public.site_settings
  for select to anon
  using (
    key in (
      'site_wall_open',
      'events_visible',
      'home_stats',
      'promo_years',
      'activity_card_images',
      'sponsor',
      'partner_club'
    )
  );

create policy "settings_member_read" on public.site_settings
  for select to authenticated
  using (true);
