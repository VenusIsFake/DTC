-- ============================================================================
-- v2.2 (2026-08-31) — mandate member photos + profile linking.
-- Lets the console attach a photo to each bureau member and link a member to
-- an existing profile so returning members are reused, not retyped.
-- Idempotent: safe to re-run. Mirrored in supabase/schema.sql (table DDL).
-- ============================================================================

alter table public.mandate_members add column if not exists photo_url text;
alter table public.mandate_members add column if not exists profile_id uuid
  references public.profiles (id) on delete set null;

create index if not exists idx_mandate_members_profile on public.mandate_members (profile_id);
