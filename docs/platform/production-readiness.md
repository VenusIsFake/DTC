# Console Production Readiness — 2026-08-31 / 09-01 Sweep

How the admin console (`/admin`) became a complete publishing tool: the bureau can now run the
entire site — mandats, members with photos, home content, podcast, events and **accounts** — with
zero developer help and zero Supabase-dashboard work. Audit findings P0–P2 from 2026-08-31 are all
closed; this document is the reference for what exists, where it lives, and how to operate it.

Commits: `062c388 → be0dcfa` (sweep) + `f906fae` (account lifecycle). Schema: **v2.2**.

---

## 1. Mandats — photos, account links, team import

**Schema (v2.2)** — `mandate_members` gained:

| Column | Type | Notes |
|---|---|---|
| `photo_url` | `text` (nullable) | Public storage URL (`club-media`) or any image URL |
| `profile_id` | `uuid` (nullable) | FK → `profiles(id) on delete set null` — links a mandat row to a real account |

Applied live via MCP; canonical DDL in `supabase/migrations/20260831_mandate_members_photo_profile.sql`
and mirrored in `supabase/schema.sql` (§ v2.2). **New schema changes go in `supabase/migrations/`
first** (apply via MCP), then sync `schema.sql` so fresh installs match.

**Console (`À propos` tab → Mandats & organigrammes):**

- Member form: **photo upload with crop** — picking a file opens the espace-membre cropper
  (512×512 square, zoom/pan) before storing under `club-media/mandates/<mandate-id>/` — plus an
  **existing-account picker** fed by the `bureau_list_profiles` RPC (picking an account pre-fills
  the name, shows a « compte lié » badge), free-text fallback for people without an account.
- Full **edit** of any member, **↑/↓ reorder** (swaps `sort`), confirmed delete.
- **« Importer l'équipe précédente »** — one click copies the most recent other mandat's team
  (roles, photos and account links preserved; accounts re-matched by name when the link is missing;
  already-present names skipped).

**Public `/about`:** members render with their photo (`UserAvatar`, initials fallback), including
the archived-mandat chips. Header intro and partner cards come from `site_settings` (see §3).

## 2. Access control

- `/admin` is open to both **`bureau`** and **`admin`** roles (RLS already allowed bureau writes —
  the gate was the only blocker). Navbar console link follows `isBureau`.
- The **Utilisateurs** tab stays **admin-only** (role/ban powers + account lifecycle), enforced by
  RPCs server-side and hidden in the tab bar for bureau accounts.
- Role change, ban, unban and every destructive action ask for confirmation.

## 3. Home content — the « Accueil » tab

New console tab editing `site_settings` KV rows. Empty field = static fallback from
`src/data/siteConfig.ts` / hardcoded defaults — the site can never break from a bad value.

| Key | Rendered on | Fallback |
|---|---|---|
| `marquee_line` | Hero eyebrow line (uppercase) | `WE PRESENT TO YOU` |
| `hero_tagline` | Hero quote | `siteConfig.tagline` |
| `highlight_kicker` / `highlight_date` | TEDx section eyebrow | `Événement phare` / `22 Nov 2025` |
| `home_stats` | Stats strip under the hero (grid, max 6) | `siteConfig.stats` |
| `sponsor` / `partner_club` | `/about` partner cards **+ footer column** | `siteConfig` values; **empty saved name = card removed** (footer column hides when both are empty) |
| `activity_card_images` | Homepage « Écosystème » activity card images (`debates`/`workshops`/`team`) | built-in `/media` images; values are picked from published gallery images in the Accueil tab |
| `about_intro` | `/about` header paragraph | hardcoded founding sentence |

`home_stats` was previously write-only (edited but never rendered) — it now renders as the
« Le club en chiffres » strip on the homepage.

## 4. Podcast

- **Poster precedence:** the console-entered `poster_image` wins; otherwise the **YouTube
  `maxresdefault` thumbnail** is used (falling back to `hqdefault` client-side when a video has no
  maxres) — sharper than the old committed frame-grabs, and episode 5+ works with no dev commit.
- **Fabricated view counts removed** everywhere (mapping, hero chips, static data). No fake
  « 2.3k vues » anywhere on the site.
- The editor's poster field gained an **Upload** button (`club-media/podcasts/`), next to URL paste.

## 5. Events (TEDx + event pages)

- Posters uploadable from the console: TEDx talk poster, page hero, page-item poster
  (all `club-media/events/`), alongside URL paste.
- `event_page_items` are now fully **editable** (title, speaker, video, poster + description
  field added) — fixing a typo no longer means delete-and-retype.
- **Videos stay links by design** (YouTube ideal): the `club-media` storage policy accepts images
  only (25 MB cap) — real event videos belong on YouTube, the console just points at them.

## 6. Account lifecycle — no more Supabase dashboard

`SUPABASE_SERVICE_ROLE_KEY` is set in **Vercel production env** (validated against the Admin API
before adding). It is **server-only**: consumed exclusively by
`src/lib/supabase/service.ts` (guarded by an `import "server-only"`), never `NEXT_PUBLIC_`, never
bundled client-side.

**`POST /api/admin/users`** (admin session + JSON content-type required):

| Action | Body | Effect |
|---|---|---|
| `create` | `email`, `full_name`, `role` | Creates the auth user (email pre-confirmed), sets the profile role, returns a **one-time temp password** |
| `reset_password` | `user_id` | Sets a fresh temp password (old one dies instantly), returns it once |
| `delete` | `user_id` | Deletes the auth user; `profiles` cascades; authored content survives with null author |

Self-delete / self-reset are refused server-side. Temp passwords look like `Dtc-ab3d-Ef7h-Km2p`
(readable, unambiguous alphabet) and are displayed **once** in the console with a copy button —
hand them over via WhatsApp/in person; members change theirs from « Mon espace ».

**UsersTab UI:** « Inviter » modal (email / name / role), per-row temp-password and delete buttons,
availability badge when the service key is missing.

## 7. Cross-cutting

- **Shared upload helper** — `src/lib/mediaUpload.ts` (`uploadClubImage`, validation mirroring the
  storage policy: mime allow-list, 25 MB, ASCII-safe names; French error wording). Used by
  gallery / annonces / mandats / podcast / events — previously triplicated.
- **Errors surfaced, not swallowed:** About/Committees/Events tabs show DB errors inline; duplicate
  mandat labels and member names get friendly wording.
- **Key-missing badges:** `GET /api/admin/config` (bureau+) reports `youtube` / `resend` /
  `serviceKey` presence; Podcast and Annonces tabs show an explicit badge instead of failing on
  first use.
- **Fallback notices:** when a content table is empty, the relevant tab says the public site is
  showing the static fallback (mandats, TEDx talks, gallery).
- **Env matrix (production):** `YOUTUBE_API_KEY` ✅ set (YouTube import live) ·
  `SUPABASE_SERVICE_ROLE_KEY` ✅ set · `RESEND_API_KEY` ❌ missing (email broadcast dormant) ·
  Turnstile ❌ missing (captcha off).

## 8. Verification & limits

- tsc 0 · eslint 0 · vitest **22/22** (8 new tests for the upload helper) · `next build` clean.
- DDL verified live via MCP; prod smoke: all pages 200, admin routes 401 unauthenticated.
- **Not visually replayed** (no bureau/admin browser session for the agent): console write flows
  are code- and type-verified only — first real use should happen with Venus present.
- Still open: Resend + Turnstile keys (Venus), YouTube-import E2E with a bureau login.

## 9. Security hardening (v2.4, 2026-09-01 soir — pre-launch audit)

Full audit (two review agents + live Supabase advisors + anon REST probes). No CRITICAL;
everything below is now live (migration `20260901_security_hardening.sql`, schema.sql synced).

- **Candidature anti-abuse** — `applications` inserts: policy now pins `profile_id` to the
  submitter (or null) and `status='new'`; trigger rejects a second submission with the same
  name+phone per campaign (French message) and caps volume at 300/hour; unique index
  `applications_one_per_identity` backstops races. Verified live: forged `status='accepted'`
  → 42501, valid anon insert → 201, duplicate → French 400.
- **Privilege-escalation two-layer defense** — `profiles_self_update` WITH CHECK now pins
  `role`/`is_banned`/`email` via `self_role()`/`self_is_banned()`/`self_email()` (SECURITY
  DEFINER one-liners) on top of the existing column grants.
- **Email broadcast** — `announcements.emailed_at` send marker: same announcement cannot be
  re-sent until edited again (409 with guidance); recipients exclude banned members; recipient
  listing failure now returns JSON 500 instead of a thrown 500.
- **Bureau members list / annuaire** — banned members excluded from `bureau_list_profiles()`
  (recipients + Membres tab) and refused by `member_directory()`.
- **club-media storage** — mime whitelist explicit (JPEG/PNG/WebP/GIF), SVG no longer accepted
  (hosted-script vector on the Supabase origin).
- **Vote privacy** — anon can still read vote *counts* (`idea_board` works, verified) but no
  longer the `user_id` column (attribution harvest closed; Realtime follows the same
  privileges).
- **Author display fix** — anon got NULL author names on annonces/idées; new
  `profiles_public_read` policy (column grants already scope anon to id/full_name/avatar_url).
- **Users API** — one admin can no longer reset another admin's password (demote first);
  Supabase error strings no longer passthrough (fixed French messages, raw errors server-side
  console); temp-password generator uses rejection sampling (no modulo bias).
- **Headers** — `Strict-Transport-Security` added in vercel.json (2y, includeSubDomains, preload).

**Accepted advisor WARNs (do NOT "fix"):** `is_admin`/`is_bureau_or_admin`/`is_active_member`
stay anon-executable — RLS policies on anon-readable tables call them and policy expressions
run with the caller's privileges; revoking breaks every anonymous read. Same class for the
authenticated-executable admin RPCs (role checked inside each body).

**Still Venus-side:** Supabase **Pro plan** unlocks leaked-password protection (HaveIBeenPwned)
— enable in Auth settings after upgrading; MFA optional for bureau/admin. Resend + Turnstile
keys still pending (Turnstile would layer captcha on /candidature on top of the DB caps).

**Complément v2.5 : le verrou s'étend aux données.** Tant que `site_wall_open` reste false,
les lectures REST anonymes du contenu (annonces, idées, votes, commentaires, podcast, TEDx,
événements, mandats, galerie, à-propos, noms de membres) renvoient vide — même clé anon, même
RLS. La bascule console ouvre pages et données ensemble. Seuls `site_settings` (clé du mur)
et `recruitments`/`positions` (portail /candidature) restent publics. Raison : formulaire en
attente dans la console si besoin de préremplir avant l'ouverture — contenu invisible dehors.
