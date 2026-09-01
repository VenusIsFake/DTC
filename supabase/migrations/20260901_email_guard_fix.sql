-- ============================================================================
-- v2.4.1 (2026-09-01, soir) — fix: emailed_at stamp was self-defeating.
-- The shared touch_updated_at trigger bumped announcements.updated_at after
-- the broadcast route stamped emailed_at, so updated_at always stayed ahead
-- and the re-send guard (409 when updated_at <= emailed_at) never fired.
-- announcements now uses a dedicated trigger that skips the bump when ONLY
-- emailed_at changed. Content edits still bump updated_at and re-enable
-- sending. (Other tables keep the shared set_updated_at.)
-- ============================================================================

create or replace function public.set_updated_at_announcements()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  -- Skip when the only change is the email send marker: the marker must be
  -- able to move past updated_at, or the broadcast re-send guard is dead.
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
