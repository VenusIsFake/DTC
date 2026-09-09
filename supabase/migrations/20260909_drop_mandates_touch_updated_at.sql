-- ============================================================================
-- v2.8.2 (2026-09-09) — « Définir courant » crashed: record "new" has no field
-- "updated_at". Baseline schema created trigger touch_updated_at (set_updated_at())
-- on mandates along with 6 content tables — but mandates has no updated_at
-- column (the others do). Every UPDATE on mandates failed; nobody had ever
-- updated a mandat row before (is_current was set at creation time until now).
-- Drop the bogus trigger; mandates keeps only single_current_mandate.
-- ============================================================================

drop trigger if exists touch_updated_at on public.mandates;
