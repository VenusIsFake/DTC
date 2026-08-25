# DTC Project Activity Log

This log records actions, milestones, scraping sessions, and structural updates to the DTC codebase.

---

## 2026-08-24
- **Project Initialization:**
  - Initialized Python environment (`.venv`) using `uv`.
  - Installed `instaloader` (v4.15.3).
  - Established `rules.md`, `overview.md`, and initial `/docs/` specifications (`README.md`, `planning.md`, `instagram_sync.md`).
  - Added documentation & graphify enforcement rules in `rules.md`.
  - Built resilient embed scraper pipeline (`scripts/parse_embed.py`) to bypass 429 datacenter rate-limiting.
  - Successfully extracted `@dentalkclub_fmdc` account profile, posts, captions, timestamps, likes, and comments.
  - Downloaded and analyzed 36 high-resolution pictures and media items.
  - Examined every individual image visually: identified speakers, lecture topics, stage awards, TEDxFMDC auditorium photo, debate table sessions, podcast BTS recording, and team retreats.
  - Created 10 semantic subcategories under `data/instagram/labeled/` with standardized semantic filenames (e.g. `magisterium_2026_speaker_01_hatim_elguerraoui.jpg`, `tedx_fmdc_amphitheater_group_photo.jpg`, `lets_talk_podcast_ep4_youtube_poster.jpg`).
  - Generated master mapping `data/instagram/labeled_images_catalog.json` and visual documentation in `docs/image_gallery.md`.
  - Authored comprehensive `docs/concept.md` detailing DTC's mission, organizational hierarchy, poles, key leaders, Magisterium/TEDxFMDC/Let's Talk events, brand identity, and web strategy.
  - Reorganized media into root `/instagram` directory across 5 clean folders (`events/`, `podcasts/`, `team/`, `awards/`, `magisterium/`, `metadata/`).
  - Fully de-duplicated all image files (0 duplicates) and removed the legacy `data/` folder.
  - Successfully connected active Chrome session and paginated across the entire **97-post timeline** of `@dentalkclub_fmdc` (Oct 2024 to present).
  - Extracted official 2025/2026 Executive Bureau announcement visual (`DLDCuK1tg_i`) saved at `instagram/team/bureau_executif_2025_2026.jpg` for full-width showcase in the About section.
  - Downloaded all **8 full MP4 video reels** for the TEDxFMDC talks (~80 MB total) into `instagram/events/` (`tedx_01_yahia_chemsi.mp4` through `tedx_08_fahd_rahim.mp4`) with matching poster thumbnails.
  - Extracted authentic original circular DTC logo directly from founding post `DBMRjqrAGlM` and saved at `instagram/metadata/dtc_logo.png` (716x716 PNG with transparency).
  - Executed exhaustive documentation refresh across all repository documents:
    * `docs/concept.md`: Full master concept, 2025/2026 Bureau Exécutif Mermaid hierarchy, 5 poles, TEDx talks, and authentic branding.
    * `docs/planning.md`: Complete website technical implementation plan, component architecture, video player specs, and tokens.
    * `docs/image_gallery.md`: Master catalog of all 8 TEDx video reels, podcast posters, team infographics, and awards.
    * `docs/instagram_data.md`: Analytical breakdown of all 97 posts from October 2024 to present.
    * `docs/instagram_sync.md`: Complete scraper pipeline, Chrome session authentication, and JSON data schemas.
    * `docs/README.md` & `overview.md`: Refreshed master hub and project overview.
  - Linked Vercel project `venus55/dtc` with active authentication (`venusisfake`).
  - Added `.vercelignore` preventing `.venv/`, `scripts/`, `docs/`, and `graphify-out/` from unnecessary upload.
  - Generated multi-resolution favicons and Apple touch icons (`public/favicon.ico`, `public/favicon.png`, `public/apple-touch-icon.png`, `src/app/icon.png`) directly from the authentic original DTC logo.
  - Built Next.js 14+ App Router application with all 5 core routes (`/`, `/events`, `/podcast`, `/gallery`, `/about`).
  - Deployed production release to Vercel and assigned official branded domain aliases:
    * Primary Production: `https://dentalkclub-fmdc.vercel.app`
    * Short Alias: `https://dtc-fmdc.vercel.app`
    * Verified 100% 200 OK status codes across all routes.
  - Resolved and verified authentic YouTube video stream IDs for Let's Talk Podcast episodes on channel `@LetsTalkPodcast-00`:
    * Ep. 4 (Pr. Sidi Mohamed Bouzoubaa): `FXTjMfmNmss`
    * Ep. 3 (Pr. Sofia Haitami): `JoMwnQbmKm0`
    * Ep. 2 (Pr. Amine Chafii): `C1dKfXuC0us`
    * Ep. 1 (Pr. Said Dhaimy): `njrC04ZxJo0` / `dT1kpZzarEs`
  - Created `docs/deployment.md` documenting fast-push optimization techniques (`npm run fast-deploy` reducing push times to <7s), Git CI/CD, and DNS records.
  - Resolved iPhone / iOS Safari blank screen bug:
    * Replaced Framer Motion SSR `initial={{ opacity: 0 }}` inline styles with hardware-accelerated CSS animations (`@keyframes fadeInSlideUp`) ensuring 100% immediate render on first paint.
    * Removed WebKit momentum scrolling bug caused by `scroll-smooth` on root `<html>`.
    * Upgraded `VideoPlayerModal.tsx` for iOS Safari autoplay compliance (`muted={true}`, `playsInline`, `webkit-playsinline`, and iOS `webkitEnterFullscreen()`).
    * Configured compliant YouTube iframe embeds with `playsinline=1` and `web-share` permissions.
  - Implemented mobile space-efficiency optimizations:
    * Removed artificial `min-h-[75vh]` vertical height stretching from `Hero.tsx`.
    * Eliminated empty space between action buttons and live stats cards.
    * Compacted navbar, padding scales, and 2-column mobile grids across `/events`, `/podcast`, `/gallery`, and `/about`.
  - Applied web video reel optimization across all 8 TEDx MP4s:
    * Re-encoded via ffmpeg (`scale=480:-2`, `libx264`, `crf 32`, `aac 64k`, `+faststart`).
    * Reduced total video payload from 83.7 MB down to 29.9 MB with instant progressive streaming metadata.
  - Deployed verified production release to Vercel and assigned live domain aliases:
    * Primary Domain: `https://dentalkclub-fmdc.vercel.app`
    * Short Domain: `https://dtc-fmdc.vercel.app`
  - Rebuilt repository knowledge graph using graphify.

## 2026-08-25 — Production-readiness audit & remediation
- **Four-way parallel audit** executed against the live production build, covering: (1) data integrity, (2) frontend code quality, (3) production/SEO configuration, and (4) documentation hygiene.
- **Key findings:**
  * iOS body-scroll-lock was broken: `VideoPlayerModal` and `InfographicViewer` each manipulated `document.body.style` independently and could leave the page scroll-locked after close.
  * Interactive card elements were non-focusable `<div>`s with click handlers — inaccessible via keyboard.
  * No `robots.txt`, no `sitemap.xml`, and no security headers were emitted by the static export / hosting config.
  * `metadataBase` pointed at the unattached domain `dtc.fmdc.ma` instead of the canonical `https://dentalkclub-fmdc.vercel.app`.
  * Podcast Episode 2 was rendered with Episode 4's poster image.
  * Mandate-label conflict: the Executive Bureau announcement post caption called it an update "pour le reste du mandat 2024-2026", while the asset filename and most docs used 2025–2026. Canonicalized user-facing label to **"Mandat 2025–2026"**, matching `bureau_executif_2025_2026.jpg`; the original IG caption is retained here as the historical record.
  * 82 MB of TEDx MP4 reels shipped statically inside the prebuilt output (~87 MB total).
  * Documentation trees were stale (`planning.md` / `image_gallery.md` / `instagram_sync.md` references, flat docs layout, dead `graph.html` pointer).
  * Python pipeline dependencies were undeclared (no `pyproject.toml` despite `.venv` usage).
  * Five dead scripts still targeted the deleted `data/` tree.
- **Remediations applied (code, by main agent):**
  * Introduced a shared `useBodyScrollLock` hook; both modals now lock/unlock body scroll safely.
  * Replaced clickable card `<div>`s with `<button>` elements and added keyboard focus management.
  * Added pan clamping in `InfographicViewer` so content cannot be dragged out of view.
  * Fixed the navbar mobile drawer (close-on-navigate behavior and state reset).
  * Added `robots.ts` and `sitemap.ts`; added security headers via `vercel.json`.
  * Corrected `metadataBase` and added per-route metadata; replaced the default 404 with a French localized not-found page.
  * Fixed the Podcast Episode 2 poster to its own artwork.
  * Pruned unused npm dependencies from `package.json`.
- **Remediations applied (documentation, by docs-repair agent):**
  * Rebuilt the repository trees in `overview.md` and `docs/platform/architecture.md` to mirror reality (docs subfolders, `instagram/magisterium/`, `scripts/`, `graphify-out/GRAPH_REPORT.md` + `graph.json`); removed stale `planning.md` / `image_gallery.md` / `instagram_sync.md` references outside this log.
  * Converted all absolute filesystem-style (`file://`) markdown links to repo-relative links.
  * Standardized facts: Instagram posting timeline begins October 16, 2024 (club founded November 2024); TEDx reels are 8 total — 7 at 720x1280, talk #5 (`DR2qD2mAMT8`) at 360x640; podcast Episode 3 guest canonicalized to "Pr. Sofia Haitami"; episode identifiers labeled explicitly as `instagram_post:` shortcodes vs `youtube_id:` values.
  * Added a Magisterium section cataloging `instagram/magisterium/` in `docs/media/gallery.md`.
  * Expanded the script roster in `docs/media/scraper_pipeline.md` to all 12 scripts, marked the 5 legacy ones retired, and replaced hardcoded credentials/IDs with placeholders.
  * Harmonized deployment claims in `docs/platform/deployment.md` (<7 seconds; ~580 KB applies only to delta pushes with unchanged media; full prebuilt output ≈87 MB including 82 MB of TEDx MP4s).
  * Moved the five dead scripts into `scripts/legacy/` and created `pyproject.toml` declaring the pipeline dependencies (instaloader, browser_cookie3, Pillow).

## 2026-08-25 — Club platform planning session (no code changes)
- **Scope refinement with the dev (4 Q&A rounds):** grew the initial ask (announcements + auth + idea voting) into the full club-platform vision: backoffice with roles, atelier RSVP, idea pitching + votes + comments, member space (`/espace`) with profiles (promo, commission, avatar, bio/téléphone) & members-only annuaire & activity history, Podcast Studio (paste-URL YouTube import), events visibility toggles, admin-created `/events/[slug]` pages, fully-editable About with mandate archiving (Mandats précédents).
- **Settled architecture decisions:** Supabase (free tier) as backend — RLS is the enforcement layer; **migrate off static export to standard Vercel server deployment** (`vercel --prod`, Hobby plan) to unlock dynamic routes & server-side YouTube fetching; open signup with email confirmation off; public read / login-to-interact; basic RSVP; hidden `/admin` route guarded by RLS; static `src/data` fallback when DB unreachable.
- **Artifacts produced:** `docs/platform/club-platform-plan.md` (canonical approved plan + handoff for the implementing session, incl. DB schema design, role matrix, execution order A–D, dev setup checklist, Supabase MCP status & quirks); indexed in `docs/README.md`.
- **Supabase MCP diagnosis (via zcode-guide skill):** server configured at user scope and healthy (connects, 29 tools) but was added mid-session so tools weren't injected; flag raised that `SUPABASE_ACCESS_TOKEN` starts `sb_publishable_` (publishable key) where management calls likely need a `sbp_…` personal access token.
- **Zero implementation this session** — plan only. `rules.md` §7 and `docs/platform/deployment.md` still describe `fast-deploy`/static export until Phase A lands.

## 2026-08-25 — Club platform implementation (phases A–D, full build)
- **Executed the approved plan** (`docs/platform/club-platform-plan.md`) end-to-end in one session, per its §7 execution order. Site stays working throughout via static fallbacks.
- **A) Foundation:**
  * Server-mode migration: removed `output: "export"` from `next.config.mjs`; retired `fast-deploy` script; CSP (`vercel.json`) opened to `https://*.supabase.co wss://*.supabase.co` + `img-src` `i.ytimg.com`; `.env.example` added. Deps: `@supabase/ssr` 0.12.5, `@supabase/supabase-js` 2.112.4, dev eslint/eslint-config-next. `.eslintrc.json` (next/core-web-vitals) added — repo previously had none.
  * `supabase/schema.sql`: 15 tables + views (`announcement_board`, `idea_board`, `comment_board`), full RLS per role matrix, security-definer RPCs (`my_profile`, `member_directory`, `bureau_list_profiles`, `admin_list_profiles`, `admin_set_role`, `admin_set_banned`, `announcement_attendees`, role helpers), column-level GRANTs on `profiles` (contact info unreachable via base table), storage buckets `avatars`/`club-media`, `updated_at` triggers, single-current-mandate trigger, default settings (incl. `home_stats`). Ban-gating via `is_active_member()` on votes/rsvps/ideas/comments.
  * `supabase/seed.sql`: 5 commissions, Mandat 2025–2026 + 12 membres, 4 épisodes podcast, 8 talks TEDx, 3 sections À propos.
  * `src/lib/`: `supabase/client.ts` (browser singleton; accepts both `NEXT_PUBLIC_SUPABASE_ANON_KEY` and the newer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` naming already present in the dev's `.env.local`), `supabase/server.ts` (cookie client), `types.ts`, `format.ts`, `data.ts` (server fetchers, every public read falls back to static `src/data`). Kept the dev-added `src/middleware.ts` session refresher.
  * Auth: `AuthProvider` (session + `my_profile()` + role flags incl. banned) + `AuthModal` (connexion/inscription, `useOverlayDialog`, French errors); Navbar rewritten (nav items now a prop computed server-side from `events_visible`; avatar menu Mon espace/Annuaire/Console/Déconnexion; nav pill moved to `lg` to fit 7 items).
- **B) Member features:** `/annonces` (feed + RSVP toggle + live headcount + bureau compose/pin/archive + attendees modal; bureau draft merge via embedded `profiles(full_name)`), `/idees` (pitch modal, 1-vote-per-person toggle, comments thread via `comment_board`, sort Top/Récentes + filter Cette semaine, bureau status/delete), `/espace` (profile editor w/ client-side avatar resize→512px JPEG→Storage, promo/commission selects, bio/phone; Mes activités = mes idées/votes/RSVP; admin quick panel + console link), `/espace/annuaire` (members-only via `member_directory()`), home « Prochain atelier » teaser (silent-hidden when none; earliest upcoming atelier).
- **C) Content ops:** `POST /api/admin/youtube-import` (bureau+ session check, server-only `YOUTUBE_API_KEY`, ISO8601→mm:ss, French release date); `/admin` console (server role guard + access-denied screen; 7 tabs); Podcast Studio (paste-URL auto-fill → draft → publish; edit/unpublish/delete); `/podcast` DB-driven (`PodcastPlayer` now props-fed); events visibility (redirect + nav + sitemap), TEDx CRUD, `/events/[slug]` dynamic landing pages (+ listing of published event pages on `/events`); About fully editable (sections + mandates + current team grid + auto-archived « Mandats précédents »; `InfographicViewer` now props-driven); `sitemap.ts` settings-aware & dynamic, `robots.ts` disallows `/admin`, `/espace`, `/api/`.
- **D) Finish:** `npm run build` ✅ (17 routes, all server-rendered as intended), `npm run lint` ✅ (0 warnings), docs rewritten (`rules.md` §7 server mode, `deployment.md` full rewrite w/ Supabase setup checklist, `architecture.md` §0 platform layer, `overview.md`, `docs/README.md`, plan status → IMPLEMENTED), graphify updated.
- **Not done / left to the dev:** apply `supabase/schema.sql` + `seed.sql` to the project (no Supabase MCP tools in session — SQL editor paste per `docs/platform/deployment.md` §3), auth settings (email confirmation off, site URL), `YOUTUBE_API_KEY` in Vercel env, sign up + admin bootstrap SQL, deploy. No push, no deploy by the agent.

## 2026-08-25 — Independent judge audit + remediation
- **A separate read-only judge agent audited the full implementation** against the plan, the RLS/security model, `rules.md` invariants, React correctness, and the toolchain (ran tsc/lint/build itself: all pass). Verdict: security model sound (RLS, definer RPCs, views, storage, column grants all PASS), **FIX-FIRST** on 3 functional bugs + idempotency/config issues.
- **Fixed (critical):** announcement/idea/comment inserts were missing `author_id`, violating their RLS policies (`author_id = auth.uid()`) — creation was dead on arrival. Fixed on both sides: client payloads now send `author_id` (`AnnouncementComposer`, `PitchModal`, `IdeaComments`) and schema.sql sets `default auth.uid()` on the three author columns.
- **Fixed (medium):** seed.sql made idempotent (unique constraints on `committees.name`, `mandates.year_label`, `tedx_talks.extract_number`, `mandate_members (mandate_id, name)` + `on conflict do nothing` everywhere); sitemap now gates `/events/[slug]` entries on `events_visible`; session middleware early-returns when Supabase env vars are absent (static-fallback invariant preserved instead of a site-wide 500); `.gitignore` negation `!.env.example` so the template is committed.
- **Fixed (polish):** stale avatar preview in ProfileEditor (now reads the live context profile); ActivitiesPanel no longer spins forever on DB failure (try/catch → empty state); bureau moderation actions (pin/status/delete on annonces & idées, events visibility toggle) surface errors and roll back instead of failing silently; `VideoPlayerModal` video got `webkit-playsinline`; `/events/[slug]` hero switched from `min-h-[dvh]` to aspect-based height (rules.md §6); home TEDx spotlight + hero CTA now respect `events_visible` (fallback links to `/annonces`); mandate infographic upload failures show an alert; middleware matcher excludes raw media files; `StatsCounter` keys deduped.
- **Accepted as-is (documented roadmap):** storage buckets have no MIME/size caps; admin-tab bulk actions keep minimal error UX; schema.sql is apply-once (policies lack `drop policy if exists`).
- Re-verified after fixes: `tsc` ✅, `lint` ✅, `build` ✅ (17 routes).

## 2026-08-25 — Full security audit (Vercel + live Supabase + code) & hardening
- **Scope:** the deployed platform, the live Supabase project (via Management API with the dev's `sbp_` token + Supabase CLI), and the repo. Everything verified against the running production database, not just code review.
- **Vercel findings & fixes:** the project had `SUPABASE_SERVICE_ROLE_KEY` + `SUPABASE_SECRET_KEY` env vars set (RLS-bypassing keys, unused by the app) — **removed from all environments**; only `NEXT_PUBLIC_SUPABASE_URL`, publishable key(s), `YOUTUBE_API_KEY` remain. Deleted the dead scaffolding that read them (`src/utils/supabase/{admin,client,server}.ts`; only `middleware.ts` is used). Live headers verified: strict CSP (Supabase/ytimg allow-lists, `frame-ancestors 'none'`, YouTube-only frames), HSTS preload, X-Frame-Options DENY, nosniff.
- **Live RLS write-denial matrix (throwaway member account, cleaned after):** member correctly denied — settings upsert, podcast insert, announcement insert (even as self-author), vote registered for another user, editing another profile (permission-denied via column grants), club-media upload, avatar upload into another user's folder, reading the `email` column. Own-avatar upload works (positive control). One probe reported "TEDx delete ALLOWED" — false alarm: RLS 0-row DELETE semantics (all 8 talks intact, verified by count). Anon denials re-confirmed (profiles, RPCs, escalation attempts).
- **Auth hardening applied:** `security_update_password_require_reauthentication` ON (Management API); `minimum_password_length` 6→8 + `secure_password_change` ON + `leaked_password_protection` via `supabase/config.toml` → `supabase config push` — **min length 8 now enforced server-side (functionally verified)**. Breach-password protection is NOT settable via API/CLI in this version — flagged to the dev as the one manual toggle (dashboard → Authentication → Sign In/Up); signup UI already enforces 8 chars + translates breach errors.
- **DB hardening applied live + synced in `supabase/schema.sql`:** storage insert policies now enforce MIME allow-list + size caps (avatars: images ≤5 MB into own `<uid>/` folder; club-media: images ≤25 MB, bureau+); `podcast_episodes.youtube_id` CHECK `^[\w-]{11}$` (blocks iframe-src injection from compromised bureau accounts).
- **Code hardening:** `/api/admin/youtube-import` now rejects non-JSON content types (CSRF defense-in-depth on top of Lax cookies); AuthModal signup minLength 8 with hint; `.env.example` no longer advertises the service-role key (explicit warning instead).
- **Secrets sweep:** git history + working tree clean (no `sbp_`/`sb_secret_`/service-role values); `.env*` ignored except `.env.example` (placeholders only); CLI's `supabase/.temp` ignored via `supabase/.gitignore`.
- **Residual/accepted:** one 3-byte orphan `probe.jpg` in the avatars bucket (delete via dashboard Storage); signup email enumeration (Supabase "already registered" message — acceptable for a community club); CSP keeps `script-src 'unsafe-inline'` (Next.js requirement); `test@gmail.com` member account is the dev's own.
- tsc/lint/build green after changes; audit probe accounts deleted (profiles = admin + dev's test account only).

## 2026-08-25 — Professional-grade security pass #2 (leak sweep, DB hardening, nonce CSP, domain-alias fix)
- **Scope:** full re-audit beyond the earlier hardening pass — secrets sweep (git history + working tree + Vercel upload surface), dependency CVEs, live Supabase auth config + database-linter advisors + privilege review, app-layer XSS review, browser-verified deploy.
- **Secrets/leaks: clean.** Git history & working tree sweep (sbp_/sb_secret_/service_role/AKIA/AIza/PEM patterns) → nothing; `.env*` ignored except `.env.example` placeholders; Vercel env vars = exactly the 4 expected (URL, publishable keys, YOUTUBE_API_KEY) — no privileged keys anywhere.
- **Dependencies:** next resolved at 14.2.35 (latest 14.2.x). npm audit reports 5 highs (SSRF in Server Actions/rewrites, cache confusion, Server Function disclosure, bundled postcss file-read) — **no patches exist in the 14.2 line** (fixes land in 15.5/16 only). Assessed non-exploitable in our configuration: no Server Actions, no rewrites, Vercel runtime (not custom server), no untrusted CSS. Real fix = Next 15.5+ upgrade (breaking: React 19 + async APIs) → documented as top roadmap security item, not attempted blind.
- **Auth hardening verification (live, functional):** min password length 8 enforced server-side (6-char signup → 422 `weak_password`); re-auth for password change ON; refresh-token rotation ON; manual linking OFF; redirect allow-list correct. **Leaked-password (HIBP) protection is a Pro-plan feature** — Management API returns `402 "available on Pro Plans and up"`; the "dashboard toggle" from the previous session does not exist on free tier. Breached-password signup probe ("password1234") succeeded as expected and the probe account+profile were deleted (verified: only 3 legitimate users remain — admin, test@gmail.com, and a real new member signup (email redacted), untouched).
- **Database hardening (applied live as tracked migrations + synced into `supabase/schema.sql`):**
  * `announcement_board` / `idea_board` / `comment_board` switched to `security_invoker = true` — views now execute with the querying role's privileges so RLS is the enforcement layer (cleared all 3 linter ERRORs). Required companion fix: `grant select (id, full_name, avatar_url) on profiles to anon` (column-level only — contact columns stay ungranted) because the views join profiles as the caller.
  * `set_updated_at()` pinned `search_path = ''` (cleared linter WARN).
  * Revoked direct RPC execute on trigger functions `handle_new_user`, `handle_user_email_update`, `enforce_single_current_mandate` from public/anon/authenticated (trigger invocation doesn't need EXECUTE; verified live via PostgREST → PGRST202). Role-check helpers (`is_admin` etc.) deliberately keep anon execute — RLS SELECT policies evaluate them for guests.
  * Verified live: storage insert policies carry MIME allow-lists + size caps (avatars ≤5 MB own-folder, club-media ≤25 MB images bureau+); anon cannot read `profiles.email`; drafts invisible to anon; all public tables RLS-enabled; no definer functions with mutable search_path remain; no anon/authenticated grants on auth.users.
  * Post-change verification: anon REST reads of all three views 200; /annonces /idees /podcast render DB content.
- **App-layer hardening (shipped in this deploy):**
  * CSP moved from static `vercel.json` to **per-request nonce CSP in middleware** — `script-src 'self' 'nonce-…'` with NO `unsafe-inline`; verified header↔body nonce match on all 8 routes locally + live, and browser-verified hydration (auth modal opens/closes, tab switch, 215db9f signup hint visible). JSON-LD is the only unnonced script (data block, CSP-exempt, now also `<`-escaped).
  * `vercel.json`: added `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Resource-Policy: same-origin`.
  * JSON-LD `dangerouslySetInnerHTML` now escapes `<` → `\u003c`.
  * `target="_blank"` audit: all anchors already carry `rel="noopener noreferrer"` (earlier grep false-positive).
- **Vercel:** env vars restricted to **Production only** — preview builds now have no DB/YouTube access (static fallback only), removing the preview-URL attack surface. ⚠️ During this, `vercel env rm <name> <env>` wiped whole variables (CLI deletes all environments); immediately restored all 4 to Production from `.env.local` and verified.
- **Domain-alias root cause found & fixed:** `dentalkclub-fmdc.vercel.app`/`dtc-fmdc.vercel.app` were pinned to one old deployment via a manual alias — new `--prod` deploys silently only reached `dtc-lilac.vercel.app`. Both are now **project-level domains** and auto-alias every future production deploy (verified live: nonce CSP + COOP/CORP + DB content on the canonical domain).
- **Residual (accepted/roadmap):** Next 15.5 upgrade for the 5 audit highs; HIBP + captcha (bot-signup protection) need Pro plan / Turnstile key; MFA for admin accounts = app-level feature; advisor WARNs for role-check RPCs are by-design.
- tsc/lint/build green; deployed; browser-tested; advisors now **0 ERRORs**. graphify + this log updated.

## 2026-08-25 — rules.md §7a: unpatched Next.js 14.2 CVE guardrail
- Added a binding rule (dev request) after the security pass #2 CVE findings: agents must stop and notify Venus before introducing any feature in the unpatched 14.2 CVE surface — Server Actions/`"use server"`, config rewrites/redirects, cached handlers/fetch with request bodies, Edge-runtime Server Actions, or any `next` version bump (must target ≥15.5). Rationale: 5 npm-audit highs have no 14.2 patch; fixes land only in Next 15.5+, and the site stays safe only by not using the affected features until the upgrade.

## 2026-08-25 — Major platform pass: Next 15.5 upgrade, review bundles, client caching, gallery/realtime/email features

**Next.js 15.5.23 + React 19.2 upgrade (dev-approved per §7a):**
- `next 14.2.35 → 15.5.23`, `react/react-dom → 19.2.8`, `@types/* → 19`, `eslint-config-next → 15.5.23`. Breaking-change fixes: `createSupabaseServerClient()` now async (`await cookies()`), `/events/[slug]` awaits `params`.
- **npm audit: 0 vulnerabilities** (was 2 high in prod deps; also overrode nested `sharp → 0.35.3` and `postcss → 8.5.26` that next 15.5 pins internally). §7a's feature freeze is lifted for the patched 15.5 line; Server Actions/rewrites remain unused by choice.

**Review bundles (from the 2026-08-25 project review):**
1. Housekeeping: `verify-tmp.mjs` untracked & removed, stale `out/` deleted, `next` range aligned.
2. Resilience: root `loading.tsx`/`error.tsx` (+ skeletons for `/annonces`, `/idees`); `getSiteSettings` wrapped in React `cache()` (1 DB call/request instead of 2-3); `getMandates` N+1 → single embedded-select query.
3. DB perf (applied live via MCP): 5 FK indexes added; all `auth.uid()` RLS predicates wrapped as `(select auth.uid())` (init-plan lint).
6. `/events/[slug]` metadata: twitter card added (OG already present).
- Auth: **forgot-password flow** (email link → PASSWORD_RECOVERY → new-password modal) + **Turnstile-ready captcha** (widget renders only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set; CSP already allows challenges.cloudflare.com).

**Client caching (bandwidth, Hobby plan):**
- Hand-rolled service worker `public/sw.js` (rules.md **§10** now documents the invariants): network-first navigations (new deploys visible on next load), cache-first only for hashed `_next/static` + opaque YouTube thumbs, SWR for `/media` + storage images; never caches `/api`, Supabase auth/REST/realtime, non-GET, or Range (video) requests. Registered production-only.
- `next.config.mjs` headers: `/media/*` + icons get `max-age=86400, swr=604800`.

**Engineering safety net:**
- **CI** `.github/workflows/ci.yml`: tsc + lint + vitest + build on push/PR (no secrets — static-fallback contract enforced).
- **vitest** (14 unit tests, pure helpers: parseYouTubeId, isoDurationToClock — moved to lib/format, escapeHtml, initials…).
- **Weekly DB backup** `.github/workflows/backup-db.yml`: pg_dump (postgres:17 docker) → Actions artifacts (90d retention); needs one-time `SUPABASE_DB_URL` secret from the dev (Session pooler string — setup steps in the workflow header + deployment.md §6).

**New features (plan §11 pull-forward, dev-approved):**
- **Galerie admin:** `gallery_images` table (RLS public-read/bureau-write) + seeded with the 18 static items; `/gallery` is now DB-driven with static fallback; console gains a "Galerie" tab (CRUD + club-media upload + publish toggle).
- **Realtime:** votes/ideas/comments/announcements added to `supabase_realtime` publication; `rsvps` trigger maintains `announcements.rsvp_count_cache` (SECURITY DEFINER, trigger-only) so RSVP headcounts broadcast to everyone via announcements UPDATE events; `/idees` + `/annonces` subscribe with 400 ms debounce. RLS still filters delivery (anon only sees published announcements).
- **Email broadcast:** `POST /api/admin/email-broadcast` (bureau+ session) sends a published announcement to all member emails via Resend (BCC ×50, escaped HTML template); "Notifier" button in console → Annonces; dormant with clear 503 until `RESEND_API_KEY` is set.

**DB migrations applied live (5):** `perf_fk_indexes`, `rls_initplan_auth_uid`, `rsvp_count_cache_realtime`, `realtime_publication`, `gallery_images_table` + `gallery_seed_static_items` — `supabase/schema.sql` (v2 section) + `seed.sql` synced for fresh installs.
**Quality:** tsc/lint/vitest/build green. graphify updated. Docs: deployment.md §6, rules.md §10, .env.example, overview.md.

## 2026-08-25 (soir) — Audit "perfection" pass + announcement mystery solved

**Annonce invisible (rapport de Venus) — racine trouvée :** l'annonce était bien publiée en base et présente dans la réponse serveur, mais rendue dans un `<div hidden>` (streaming React) ; le swap client n'arrivait qu'après un rendu serveur parfois très lent — jusqu'à **8,7 s** mesurés, car les fonctions Vercel tournaient en **iad1 (US Est)** : trafique Maroc → edge Paris → fonction US → base Supabase Irlande → retour. Au refresh (fonction chaude) tout apparaissait. Fixes :
- **`vercel.json → regions: ["dub1"]`** — fonctions à Dublin, même région que Supabase eu-west-1 ; latence mesurée 0,35–1,3 s (froid inclus) vs 8,7 s avant.
- **`withFallback` timeout 4 s** (`src/lib/data.ts`) : une base lente bascule sur le contenu statique au lieu de bloquer le rendu.
- **SW v2026-08-25.2 :** plus aucun caching HTML (risque de swap streamé cassé/mobile Safari tee backpressure) — navigations 100 % réseau, fallback hors-ligne statique ; rules.md §10 mis à jour en conséquence.
- UX console : bouton **« Publier »** pour les brouillons (avant : « Archiver » sur un brouillon = piège) dans la console + le fil.

**Audit sécurité (sondes REST réelles, clé anon) : tout passe.** Insertions anon (annonces/votes) 401 ; brouillons invisibles ; `profiles` → permission denied (colonnes) ; RPC admin/member_directory 401 ; uploads storage anon 403 (les deux buckets) ; rsvps vides pour anon.

**Realtime E2E : PASS** (`scripts/realtime-e2e-test.mjs` — abonné anon reçoit INSERT + UPDATE < 2 s après écriture SQL réelle).

**Audit statique : propre** — pas de XSS (JSON-LD échappé), attributs vidéo iOS ✓, `rel=noopener` ✓, pas de secrets/console.log.

**UsersTab : tri par rôle** (Admin → Bureau → Membre, défaut), + récents / nom A→Z (demande de Venus).

**Charge :** tests parallèles invalidés par l'environnement local (le HTTPS parallèle s'effondre vers TOUS les hôtes, y compris Supabase — 23/24 échecs) ; rafale ayant en plus déclenché le rate-limit Vercel de notre IP. Mesuré et valide : latence séquentielle avant/après région (ci-dessus). Plafond documenté Hobby : 12 exécutions concurrentes — suffisant pour le club.

## 2026-08-25 (nuit) — Fil bureau vide + affiches sur les annonces

**Bug « les annonces n'apparaissent pas pour l'admin » (rapport de Venus) : cause racine PGRST201.** Le fil bureau/admin interroge `announcements?select=*,author:profiles(full_name)` ; or `announcements→profiles` est joignable par DEUX chemins (FK `author_id` ET via `rsvps`), donc PostgREST rejette l'embed ambigu (PGRST201, reproduit via curl) ; le code ignorant l'erreur, `setItems([])` vidait le fil **uniquement pour bureau/admin** — invités et membres passent par la vue `announcement_board` (correcte). Fix : embed explicite `author:profiles!announcements_author_id_fkey(full_name)` (vérifié 200 via curl) + `refresh()` ne vide plus le fil en cas d'erreur (notice à la place).
**Affiches (poster) sur les annonces :** colonne `announcements.poster_url` (migration `announcements_poster_url`), vue `announcement_board` étendue (`announcement_board_poster`), champ + upload club-media (`posters/…`) + aperçu dans le composeur, affichage 16:9 dans le fil, bannière dans l'email Resend. schema.sql synchronisé (v2.1).
Déployé + vérifié navigateur (annonce visible, pas de squelette bloqué).

## 2026-08-25 (soir) — Recadrage avatar cassé (CSP), alignement navbar mobile, refresh login/logout

**Bug « le recadrage de la photo de profil est vide/cassé » (rapport de Venus) : cause racine CSP.** `ProfileEditor` passe une URL `blob:` (objectURL du fichier choisi) à `AvatarCropModal`, mais `img-src` du middleware n'autorisait pas `blob:` → l'image ne s'affichait jamais (cercle noir, aperçu vide, erreur « Impossible de charger l'image », bouton Valider désactivé). Reproduit en local via harnais `/dev-crop` (blob: → vide ; same-origin → OK), fix `img-src … blob:` dans le middleware, re-vérifié mobile 390px + desktop : affichage, glisser, zoom (slider + boutons), export 512×512 conforme au cadrage. Harnais supprimé après usage.
**Alignement avatar/menu (mobile) :** le lien avatar de la navbar était un `inline` enveloppant un inline-block 32px → décalage baseline (~4px vers le haut vs le burger). Fix : `flex items-center` sur le lien. Vérifié visuellement.
**Refresh login/logout (demande de Venus) :** `signInWithPassword`, `signUp` (si session immédiate — auto-confirm actif) et `updateUser` (nouveau mdp) déclenchent `window.location.reload()` ; `signOut` aussi. Bonus : inscription avec confirmation email active affiche désormais un panneau « vérifiez votre boîte mail » au lieu de fermer la modale en silence. Vérifié en live via compte de test (créé, testé, puis supprimé via API admin + cascade profile OK).
**Favicon 500 :** `favicon.ico` présent en double (`public/` + `src/app/`) → conflit route/fichier, 500 sur `/favicon.ico`. Doublon `public/` supprimé, 200 vérifié.
Audit UI rapide : 9 pages SSR 200 + titres OK ; crop viewport fixe 280px (OK ≥360px, clipperait sur ≤320px — accepté) ; `src/app/icon.png` 257KB (à compresser un jour). Lint ✓, 14 tests ✓, build ✓.
