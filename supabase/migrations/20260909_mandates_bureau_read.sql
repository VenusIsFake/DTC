-- ============================================================================
-- v2.8.1 (2026-09-09) — mandates console blind behind the wall. The v2.5 wall
-- lock gated mandates/mandate_members SELECT on site_is_open() for everyone,
-- including bureau/admin — every other console-CRUD table (announcements,
-- podcast, tedx, event pages/items, gallery, about sections) got the
-- is_bureau_or_admin() bypass, these two were missed. Inserts stayed allowed,
-- so creating a mandat in the console succeeded silently while the reloaded
-- list came back empty (Venus retried → duplicate rows). Bureau/admin now
-- always read both tables; anon stays fully walled until launch toggle.
-- ============================================================================

alter policy "mandates_public_read" on public.mandates
  using ((select public.site_is_open()) or public.is_bureau_or_admin());

alter policy "mandate_members_public_read" on public.mandate_members
  using ((select public.site_is_open()) or public.is_bureau_or_admin());
