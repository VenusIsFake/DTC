-- ============================================================================
-- v2.9.1 (2026-09-10) — profile-avatar parity for announcements.
-- idea_board/comment_board expose author_avatar; announcement_board did not —
-- announcement authors rendered as initials forever. Append author_avatar to
-- the view (CREATE OR REPLACE VIEW can only append columns, never reorder).
-- Also: announcement_attendees now excludes banned members (parity with
-- member_directory; bureau-only RPC, hygiene).
-- Applied to prod via MCP as ledger entry announcement_board_author_avatar.
-- ============================================================================

create or replace view public.announcement_board as
 select a.id,
    a.kind,
    a.title,
    a.body,
    a.event_date,
    a.location,
    a.is_pinned,
    a.status,
    a.author_id,
    a.created_at,
    a.updated_at,
    p.full_name AS author_name,
    a.rsvp_count_cache AS rsvp_count,
    a.poster_url,
    p.avatar_url AS author_avatar
   FROM announcements a
     LEFT JOIN profiles p ON p.id = a.author_id
  WHERE a.status = 'published'::text;

create or replace function public.announcement_attendees(a_id uuid)
returns table(user_id uuid, full_name text, avatar_url text, promo integer)
language plpgsql
stable security definer
set search_path to ''
as $function$
begin
  if not public.is_bureau_or_admin() then
    raise exception 'Accès réservé au bureau';
  end if;
  return query
    select r.user_id, p.full_name, p.avatar_url, p.promo
    from public.rsvps r
    join public.profiles p on p.id = r.user_id
    where r.announcement_id = a_id
      and p.is_banned = false
    order by r.created_at;
end;
$function$;
