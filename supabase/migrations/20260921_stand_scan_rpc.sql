-- ============================================================================
-- Migration: 20260921_stand_scan_rpc.sql
-- Lightweight RPC to register stand QR scans and increment invite link uses_count
-- without modifying user role before payment confirmation.
-- ============================================================================

create or replace function public.register_stand_scan(p_token text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.invite_links
  set uses_count = uses_count + 1,
      used_at = coalesce(used_at, now())
  where token = p_token and (expires_at is null or expires_at > now());
end;
$$;

revoke execute on function public.register_stand_scan(text) from public;
grant execute on function public.register_stand_scan(text) to anon, authenticated;
