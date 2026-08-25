# 🚀 DTC Club Platform — Approved Implementation Plan & Session Handoff

> **Status (2026-08-25, end of day):** **IMPLEMENTED** (phases A–D executed in one session: server-mode migration, Supabase schema/RLS/RPCs/storage, auth + navbar, `/annonces` + RSVP, `/idees` + votes + comments, `/espace` + annuaire + activités, home teaser, YouTube import route + Podcast Studio, `/admin` console with all 7 tabs, events visibility + `/events/[slug]`, editable About + mandates, dynamic sitemap/robots, docs). **Schema/seed still need to be applied to the Supabase project** (`supabase/schema.sql` then `supabase/seed.sql` — no Supabase MCP tools were available in the implementing session; the dev applies them per `docs/platform/deployment.md` §3), then sign up + bootstrap admin.
>
> **Approval trail:** Four refinement rounds with the dev (open questions resolved via AskUserQuestion — outcomes recorded in §4 "Settled decisions"). Do not re-litigate settled decisions; surface new blockers in conversation instead.

---

## 1. The vision

DTC grows from a static brochure site into a **two-layer platform**:

1. **The public site** — home, events/TEDx, podcast, gallery, about — same designs, but content served from the database and controlled by the club.
2. **The backoffice** — auth, roles, and a console where the bureau runs the club online: announcements for next week's ateliers, idea pitching + voting, podcast imports from YouTube, section visibility, event page creation, mandate/organigramme management, and account administration.

Every content type follows the same lifecycle: **draft → published → archived**, and the site falls back to today's static `src/data` content if the database is unreachable, so it can never blank out.

## 2. Current state of the repo (verify before executing)

- Next.js **14.2** App Router + TypeScript + Tailwind, currently `output: 'export'` **static export** (this plan removes that — see §3).
- 5 routes: `/`, `/events`, `/podcast`, `/gallery`, `/about`. French content, dark navy (`#0B132B`) + gold (`#D4AF37`) "premium gala" theme, glassmorphism cards (`.glass-card` in `src/styles/globals.css`), Inter + Plus Jakarta Sans.
- Content = typed modules in `src/data/` (`siteConfig.ts`, `podcastData.ts`, `tedxData.ts`, `galleryData.ts`), consumed directly by components.
- Interactivity pattern to copy: server page shell + client island (see `/podcast`); all modals **must** use `src/hooks/useOverlayDialog.ts` (iOS-safe scroll lock + focus trap).
- `next.config.mjs`: `output: "export"`, `images: { unoptimized: true }`. `vercel.json`: security headers + strict CSP (`connect-src 'self'` — blocks Supabase today; §3 fixes).
- Deploy today: `npm run fast-deploy` → `https://dentalkclub-fmdc.vercel.app` (Vercel Hobby). **The user deploys — never deploy without asking.**
- Git: repo exists, branch `main`, remote `origin → https://github.com/VenusIsFake/DTC.git`, one commit. (Older docs/memory saying "not a git repo" are outdated.)
- Only runtime deps: `next`, `react`, `react-dom`, `lucide-react`.

## 3. Architecture (settled)

| Decision | Choice |
|---|---|
| Backend | **Supabase free tier** — Postgres + RLS + Auth + Storage. Chosen over NextAuth (needs server), Firebase (weaker relational), custom backend. |
| Hosting | **Switch to server mode**: remove `output: 'export'`, deploy via `vercel --prod` (Vercel Hobby, still free). Unlocks dynamic `/events/[slug]` pages, server-side YouTube fetch, real section hiding (redirect + de-index), dynamic sitemap. |
| Security model | **RLS is the enforcement layer** — the Next app only reacts to what Supabase allows. `admin` pages are hidden routes, not secret URLs; their data is unreachable for non-admins by policy. |
| Auth | Supabase email+password, **email confirmation OFF**, **open signup** (default role `member`). New deps: `@supabase/supabase-js`, `@supabase/ssr` (cookie sessions for server components; browser client for mutations). |
| YouTube import | `POST /api/admin/youtube-import` (bureau+ session required) → YouTube Data API v3, key in server-only env `YOUTUBE_API_KEY` (never `NEXT_PUBLIC`). Returns title, description, thumbnail, duration (ISO8601 → mm:ss). UX: admin **pastes a URL**, form auto-fills, edits, publishes. |
| CSP (`vercel.json`) | `connect-src` += `https://*.supabase.co wss://*.supabase.co`; `img-src` += `https://i.ytimg.com https://*.supabase.co`. |
| Images | Keep `unoptimized: true` during migration (behavior-identical); optimization is roadmap. |
| Resilience | Public pages try DB, fall back to static `src/data` seeds if Supabase is unreachable/unconfigured. When reachable, DB is single source of truth. |
| Deploy scripts | Remove `fast-deploy`; `deploy` = `vercel --prod --yes`. Update `rules.md` §7 + `docs/platform/deployment.md` accordingly. |

### Role matrix

| Role | Powers |
|---|---|
| Guest (no account) | Read announcements, ideas, comments, vote counts |
| `member` (default on signup) | Vote (1/idea, toggle), pitch ideas, comment, RSVP, edit own profile |
| `bureau` | + publish/edit/pin announcements, moderate ideas/comments, see member contacts, manage content collections |
| `admin` (dev + president) | + manage accounts (roles, bans), delete anything, all console sections |

Bootstrap: dev signs up first, runs one-line SQL to self-promote (`update profiles set role='admin' where id='…'`), then promotes the president from the console.

## 4. Settled decisions (from the dev Q&A — do not reopen)

1. **Signup:** open — anyone registers as `member`; admins ban/promote from the console.
2. **Admin space:** hidden route `/admin` in the same app (RLS-guarded), **not** a separate deployment.
3. **Ideas scope:** pitches + votes **+ comments** (the dev explicitly upgraded from votes-only).
4. **Visibility:** public read of announcements/ideas; login required only to interact.
5. **Hosting:** switch static export → standard Vercel server deployment.
6. **Podcast import:** paste-URL auto-fill (no channel auto-scan).
7. **About:** **fully editable** prose sections from the console (structure: ordered sections with title/body — never raw HTML injection).
8. **RSVP:** yes, basic (attend/un-attend + live headcount + bureau-side attendee list; no capacity limits).
9. **Profiles:** year of study + committee + avatar upload + bio/phone (all fields chosen).
10. **Directory:** members-only `Annuaire` (name, avatar, promo, committee; contact info bureau-only).
11. **Super controls:** separate `/admin` console + a quick-stats panel card inside `/espace` linking to it.
12. **Member space:** includes "Mes activités" history (my ideas, votes, RSVPs/past ateliers).

## 5. Database design (`supabase/schema.sql` + `supabase/seed.sql`)

**Tables**

- `profiles` — `id` (↔ `auth.users`), `full_name`, `email` (copied by trigger), `role ('member'|'bureau'|'admin')`, `is_banned`, **+ `promo` (year), `committee_id`, `avatar_url`, `bio`, `phone`**, `created_at`. Auto-created on signup by trigger.
  - Self-edit restricted by column GRANTs to `(full_name, promo, committee_id, avatar_url, bio, phone)`.
  - `role` / `is_banned` changeable only via `admin_set_role()` / `admin_set_banned()` **security-definer functions** that check `is_admin()`.
- `committees` — name, description, sort. Admin-managed (they change per mandate). Promo-year list likewise admin-editable (in `site_settings`).
- `announcements` — kind (`atelier`|`annonce`), title, body, `event_date`, location, `is_pinned`, status (`draft`|`published`|`archived`), author_id, timestamps.
- `rsvps` — PK (announcement_id, user_id), created_at.
- `ideas` — title, description, status (`open`|`planned`|`done`|`rejected`), author_id, timestamps.
- `votes` — PK (idea_id, user_id) → one vote per person enforced by the DB itself.
- `comments` — idea_id, author_id, body, created_at.
- `podcast_episodes` — mirrors `PodcastEpisode` shape (`episode_number`, `title`, `guest`, `role`, `release_date`, `youtube_id`, `duration`, `synopsis`, `takeaways[]`, `sponsor`, `poster_image`, `is_featured`) **+ `is_published`**. Seeded with the current 4 episodes.
- `tedx_talks` — mirrors `TedxTalk` shape (extract_number, speaker, topic, language, video/poster/instagram URLs — keep local MP4 paths) **+ `is_published`**. Seeded with the 8 talks.
- `event_pages` — slug, title, tagline, hero poster, description, status. + `event_page_items` — talks/videos per page (title, speaker, description, video local-or-YouTube, poster). This is where "next year's TEDx" gets born, served at `/events/[slug]`.
- `site_settings` — key → jsonb: `events_visible`, home stats, promo list, etc.
- `mandates` — year label (e.g. "2025–2026"), `is_current`, infographic image (Storage). + `mandate_members` (name, role, sort). Seeded with Mandat 2025–2026. Setting a new mandate current **auto-archives** the previous into "Mandats précédents" (history never deleted).
- `about_sections` — key, order, title, body, `is_published` — the fully-editable prose.

**Read paths & security**

- Views: `idea_board` (ideas + vote/comment counts), announcement list + RSVP counts.
- `member_directory()` — security-definer function: name, avatar, promo, committee; **authenticated only**, zero contact info.
- `admin_list_profiles()` — security-definer: adds email/phone; **admin only**.
- Helpers: `is_admin()`, `is_bureau_or_admin()`.
- RLS everywhere per the §3 role matrix; drafts/published gating on content tables.
- Storage buckets: `avatars` (self-write, public-read) and `club-media` (bureau+ write, public-read) for organigramme/poster uploads.
- **Visibility semantics:** hidden section = server `redirect()` + excluded from sitemap + nav link removed — truly gone, not CSS-hidden.

## 6. Frontend plan (French UI, existing idiom, mobile-first, iOS-safe)

- **Navbar** — add "Annonces", "Idées"; "Se connecter" → `AuthModal` (sign in/up tabs, `useOverlayDialog`); signed-in avatar menu: "Mon espace", "Annuaire", "Console" (admins), "Déconnexion"; Events link follows `events_visible`.
- **`/annonces`** — public feed, pinned first, atelier cards with date/location; compose/edit modal (bureau+); "Je participe" RSVP + live headcount; bureau sees attendee list.
- **`/idees`** — pitch cards, vote toggle + counts, sort by votes/new + "cette semaine" filter, status badges (bureau-set), comment threads, inline moderation, pitch/comment forms.
- **`/espace`** (login required) — profile editor (avatar upload with client-side resize, promo select, committee select, bio, phone) · "Mes activités" · admin quick panel (member count, pending ideas, next atelier, "Ouvrir la console").
- **`/espace/annuaire`** (signed-in only) — member cards: avatar, name, promo, committee.
- **Home** — "Prochain atelier" teaser from newest upcoming announcement (silent-hidden when DB empty).
- **`/podcast` · `/events` · `/about`** — today's designs, now DB-driven with static fallback; About renders editable sections + current organigramme + archived mandates.
- **`/events/[slug]`** — dynamic landing template: hero, poster, talks grid, video modal.
- **`/admin`** — hidden from sitemap; access-denied screen for non-admins. Tabbed console:
  - **Utilisateurs** — role dropdown, ban toggle, emails
  - **Annonces** — CRUD, pin, publish
  - **Idées** — moderation, status changes
  - **Podcast Studio** — paste URL → auto-filled editor → save draft / publish; episode list, reorder (`episode_number`), unpublish
  - **Événements** — visibility toggle, TEDx talks CRUD, create event pages
  - **À propos** — sections editor (title/body/order/hide), stats, mandates manager + infographic upload
  - **Commissions & listes** — committees, promo years
- **`sitemap.ts`** — DB/settings-aware; `generateMetadata` for dynamic pages.

## 7. Execution order (site stays working throughout)

- **A) Foundation:** server-mode migration (config, scripts, docs) · Supabase clients (`src/lib/supabase/` browser + server + types) · `AuthProvider` · schema.sql · Navbar auth UI · admin shell + Users tab.
- **B) Member features:** `/annonces` + RSVP · `/idees` + votes + comments · `/espace` + annuaire + activités · home teaser.
- **C) Content ops:** Podcast Studio + import route · `/podcast` DB-driven · events visibility + TEDx CRUD + `/events/[slug]` · editable About + mandates + Storage uploads · dynamic sitemap.
- **D) Finish:** seed.sql (generated from current `src/data` + about/mandate content) · docs updates (`rules.md` §7, `architecture.md`, `deployment.md`, `overview.md`) · activity log entry · `graphify update .` · `npm run build` + lint · **commit on `main`** (no push, no deploy — the dev deploys).

## 8. Dev (user) setup checklist — write into `docs/platform/deployment.md` at the end

1. Create the free Supabase project → apply `schema.sql` + `seed.sql` (or let the agent apply via MCP — see §10).
2. Auth settings: email confirmation **off**, site URL set to `https://dentalkclub-fmdc.vercel.app`.
3. Create a YouTube Data API key (Google Cloud → enable "YouTube Data API v3" → restrict key to the domain); add to `.env.local` + Vercel env vars as `YOUTUBE_API_KEY`.
4. Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `YOUTUBE_API_KEY` (local `.env.local` + Vercel project settings).
5. Sign up → run the one-line admin bootstrap SQL → promote the president from the console.
6. Deploy with `vercel --prod`.

## 9. Constraints & obligations (from `rules.md` — binding)

- Document every significant change in `docs/audit/activity_log.md`; keep `overview.md`, `architecture.md`, `deployment.md` current.
- Run `graphify update .` (CLI `~/.local/bin/graphify`) after code/doc changes.
- iOS invariants: no `initial={{opacity:0}}` on above-the-fold; no `scroll-smooth` on `<html>`; `<video>` needs `muted playsInline webkit-playsinline`; modals use `useOverlayDialog` (never plain `overflow:hidden` body lock).
- Mobile-first (320–414px); TypeScript everywhere; WCAG; graceful error fallbacks.
- Never commit secrets (`.env*` ignored); never deploy without asking the dev.

## 10. Supabase MCP — status & known quirks

- Configured at user scope: `~/.zcode/cli/config.json` → `mcp.servers.SupaBase` (stdio, `npx -y @supabase/mcp-server-supabase@latest`, env `SUPABASE_ACCESS_TOKEN`, 30 s timeout). Server **connects fine and lists 29 tools** per ZCode logs (2026-08-25).
- It was added **mid-session**, so tools weren't injected into the planning session (MCP injects at session start). A fresh session should have `mcp__SupaBase__*` tools — **check availability at execution time**; if present, apply schema/seed directly; if not, deliver the SQL files for manual paste (both paths equally valid).
- ⚠️ **Token format:** current value starts `sb_publishable_` (a client publishable key). The MCP's management calls likely need a **personal access token** (`sbp_…`, from supabase.com/dashboard/account/tokens). If tools 401, that's why — ask the dev to regenerate & swap in `~/.zcode/cli/config.json`.
- Known benign quirks: ZCode `ping` unsupported on the negotiated protocol → periodic stale-reconnect (self-heals); `npx …@latest` re-downloads on spawn → occasional cold-start `fetch failed` (pin a version or `npm i -g` if it recurs).

## 11. Out of scope v1 (roadmap only)

Gallery admin · realtime subscriptions · email notifications · OAuth · i18n · `next/image` optimization · member-to-member messaging · atelier capacity/waitlists · channel auto-scan podcast import.
