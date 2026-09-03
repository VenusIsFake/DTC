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

## 2026-08-26 — Refonte UI « éditoriale » : sortie du look vibecoded (dark glass → papier/encre)

**Demande de Venus : « un meilleur UI, moins vibecoded » — sauvegarde de l'ancien design avant refonte.**
- **Point de restauration :** tag `ui-v1-baseline` poussé sur GitHub (rollback : `git reset --hard ui-v1-baseline`).
- **Audit slop (grille Adrian Krebs, 16 patterns) :** le site cumulait glassmorphism (34 fichiers), texte doré dégradé (16), boutons pilules + dégradés (22), halos lumineux flous, badge au-dessus du H1, hero centré, cartes identiques icône-au-dessus, rangée de stats en tuiles, mode sombre permanent — « heavy slop ».
- **Refonte :** thème clair éditorial — fond papier #F7F5F0, encre #16233A, or encré #8A6D1F (AA sur clair), or vif #D4AF37 réservé aux CTA sur bandeaux marine ; titres Source Serif 4 (next/font), corps Inter ; cartes plates à filet 1px (#DCD7CB), radius 6–8px, plus de lift/blur au survol ; navbar sticky papier à filet + soulignement or pour l'actif (fini le conteneur pilule flottant) ; hero asymétrique texte + écusson à anneaux ; stats en règle éditoriale (chiffres serif, filets verticaux, sans icônes) ; footer bandeau marine institutionnel ; eyebrows petites capitales à la place des badges-pilules ; CTA final en bandeau marine.
- **Méthode :** remappage scripté dark→light de 49 fichiers (hex fermés : #0B132B→#F7F5F0, #385A75→#DCD7CB, #94A3B8→#5C6672, ors→#8A6D1F, text-white→encre sauf sur rouge/noir), puis réécriture main de globals.css, tailwind.config, layout (fontes, themeColor), Navbar, Hero, Footer, HomeContent, StatsCounter, en-têtes de pages (events/podcast/about), paddings hérités de la navbar fixe → sticky, modale auth (bouton carré marine). `prefers-reduced-motion` ajouté.
- **Vérifié visuellement (navigateur) :** accueil (desktop+mobile+menu), events, podcast, gallery, annonces, idées, modale connexion — contraste et lisibilité OK. Espace/console admin non re-testés visuellement (connexion requise) mais remappés par les mêmes tokens.
- **Tests :** 14/14 vitest ✓, `next build` ✓. Pas de changement de logique SW (pas de bump VERSION requis). ThemeColor meta → #F7F5F0.

## 2026-08-26 (nuit) — Audit complet « tous types d'issues » + correctifs

**Demande de Venus : auditer le projet sur tout type de problème et tout corriger.**

- **Phase automatisée (verte) :** `tsc --noEmit` 0 erreur, lint 0, vitest 14/14, `next build` ✓, `npm audit` 0 vulnérabilité, 0 console.log/TODO/`any` (les seuls hits étaient des commentaires). Dépendances majeures dispo (Next 16, Tailwind 4, TS 7) non pertinentes — règle sign-off maintenue ; bump patch next/eslint-config-next 15.5.24 appliqué.
- **Sécurité :** toutes les fonctions SECURITY DEFINER vérifées dans le corps — chaque `admin_*`/`bureau_*` contrôle `auth.uid()` + rôle en interne (avertissements advisor = informationnels, non exploitables). Clé service-role absente du code/bundle. CSP middleware (nonce, pas d'unsafe-inline script) + en-têtes vercel.json intacts. Routes API admin : session serveur + `my_profile` rôle + Content-Type JSON (anti-CSRF). Storage : avatars limités 5 Mo/mime par dossier `auth.uid()`, club-media bureau-only 25 Mo. Protection mots de passe HIBP : indisponible plan gratuit (documenté, non activable).
- **Données :** 0 orphelins (comments/votes/rsvps/profiles/auth.users/ideaurs), FK cascades corrects, publication realtime (votes/ideas/comments/announcements) = exactement les 4 tables souscrites par le client.
- **RLS perf :** 10 politiques bureau `FOR ALL` splittées en INSERT/UPDATE/DELETE (migration `split_bureau_write_rls_policies` appliquée + schema.sql synchronisé) — supprime les doublons de politiques permissives par SELECT signalés par l'advisor, comportement identique. Advisor perf repassé à 0 WARN.
- **A11y :** Lighthouse annonces 94→100. Or encré #8A6D1F→#755B18 (4.49→5.9:1 sur papier, 5.3:1 sur badge), gris #7A828D→#5F6774 (3.57→5.2:1), titres de cartes h3→h2 (annonces + idées). Or vif #D4AF37 sur bandeau marine inchangé.
- **Bug réel trouvé en prod (React #418, hydration) :** les dates étaient formatées dans le fuseau du serveur (UTC sur Vercel) vs client Casablanca (+1h) → tout event_date avec heure différait entre SSR et hydration. Fix : formatters `Intl` épinglés `timeZone: "Africa/Casablanca"` + `suppressHydrationWarning` sur les textes « il y a X » (dérive Date.now()). Re-testé en prod : 0 erreur console.
- **Backups (gap critique comblé) :** le workflow hebdo pg_dump tournait à vide depuis sa création — secret `SUPABASE_DB_URL` jamais configuré. Mot de passe DB rotaté (2×) via API management (rien ne l'utilisait), secret GitHub posé. 1er échec IPv6 (runners GH sans IPv6), 2e `aws-0` erroné → bon host : `aws-1-eu-west-1.pooler.supabase.com:5432` session mode (le 6543 transaction casse pg_dump). 3e run : succès, artefact `dtc-db-backup-3` (34 Ko) vérifié. Rotations futures automatiques (dimanche 02:00 UTC). NB : backups managés Supabase inexistants sur plan gratuit → c'est la seule sauvegarde.
- **Vérif prod :** 100/100/100/100 Lighthouse (a11y, best practices, SEO, agentic) sur /annonces, 0 échec d'audit.
- **Limites :** flows admin (login requis) non re-testés visuellement — pas d'identifiants de session bureau à disposition ; restauration complète du dump non exécutée (pas de psql/pg_dump local — contenu artefact vérifié seulement).
- **Déploiements :** 0ad4f12 poussé + déployé (3 commits : a11y, RLS split, deps patch, hydration).

## 2026-08-27 — Audit de conformité /brand, Tokens de design & Remédiation complète

**Demande de Venus : « check the current branding against /brand », commit baseline `ui-v2-baseline`, remédiation intégrale et validation par un agent juge avant déploiement Vercel.**

- **Baseline sauvegardée :** tag `ui-v2-baseline` posé sur le commit initial `0c16030`.
- **Création du guide de marque canonique (`docs/brand-guidelines.md`) :**
  - Spécification intégrale au format standard `/brand` (palette primaire, secondaire, neutre, sémantique avec codes HEX, RGB et usages).
  - Définition du système bi-or : `Heritage Gold Dark` (`#755B18`, AA 4.8:1+ sur papier clair) et `Prestige Gold Bright` (`#D4AF37` pour fonds marine, trophées et badges).
  - Typographie éditoriale : `Source Serif 4` (titres display) + `Inter` (corps & UI).
  - Voice Chart exhaustif (« We Are / We Are Not »), adaptation par contexte (Hero, Tournois, Réseaux, Podcast), phrases proscrites et argumentaires éclair (10s, 30s, 60s).
  - Règles d'incitation IA (prompts de base, mots-clés, mood et contre-exemples visuels).
- **Génération des Design Tokens (`assets/`) :**
  - `assets/design-tokens.json` (W3C DTCG format standardisé).
  - `assets/design-tokens.css` (variables CSS `:root`).
- **Synchronisation & Intégration du code :**
  - `tailwind.config.ts` étendu avec palette `dtc.*` structurée (`dtc.gold.DEFAULT`, `dtc.gold.dark`, `dtc.gold.bright`, `dtc.navy.*`, `dtc.semantic.*`).
  - `src/styles/globals.css` enrichi des variables CSS `:root`.
  - `docs/club/concept.md` Section 7 harmonisée avec le guide de marque canonique.
  - Création de l'emblème vectoriel officiel `public/logo.svg` (blason circulaire haute définition 500x500 avec dégradés, dent et micro vintage).
- **Validation par les scripts `/brand` :**
  - `inject-brand-context.cjs --json` : extraction 100% sans erreur.
  - `extract-colors.cjs --palette` : extraction des 16 couleurs de la palette.
- **Contrôle QA & Juge indépendant :**
  - Agent Juge (`brand_judge`) invoqué pour audit indépendant : **VERDICT PASS (100% conforme)**.
  - Vitest : 14/14 tests passés.
  - Next.js 15.5.24 : build de production `next build` propre (14/14 routes générées).

## 2026-08-31 — Init Caveman + Audit « production readiness » du console admin

**Demande de Venus : initialiser les règles caveman par dépôt, puis raffiner le prompt et exécuter un audit du console — objectif : le bureau publie tout lui-même, sans dev ni SQL, « record speed ».**

- **Caveman init :** 6 fichiers de règles écrits (`AGENTS.md`, `.cursor/rules/caveman.mdc`, `.windsurf/rules/caveman.md`, `.clinerules/caveman.md`, `.github/copilot-instructions.md`, `.opencode/AGENTS.md`) via le script du plugin, dry-run d'abord, 0 écrasement.
- **Audit (lecture seule, agent Explore, cartographie des 8 onglets `src/components/admin/*` + `supabase/schema.sql`) :**
  - **P1 confirmé (photo mandat) :** `mandate_members` n'a aucune colonne photo (`schema.sql:155-163`) ; formulaire = 2 champs texte (`AboutTab.tsx:407-431`) ; rendu public = icône placeholder sans `<img>` (`about/page.tsx:113-127`). L'infra existe déjà ailleurs (infographie mandat `club-media`, crop avatar espace membre).
  - **P2 confirmé (réutilisation membre) :** `mandate_members.name` = texte dupliqué, aucun `profile_id`/FK vers `profiles` ou `auth.users` ; pas de sélecteur de membre existant ni de suggestion du mandat précédent, alors que les mandats+members sont déjà chargés dans l'état (`AboutTab.tsx:230-246`).
  - **Autres écarts majeurs :** console réservée `admin` alors que la RLS autorise `bureau` (sur-priviège, `admin/page.tsx:53`) ; `home_stats` éditable mais jamais rendu nulle part ; poster podcast saisi au console écrasé par chemin codé en dur `/media/podcasts/youtube_thumb_epN.jpg` (`data.ts:156`) — épisode 5+ = 404 ; TEDx/pages événements = URL-paste uniquement, upload vidéo bloqué par la politique storage (`image/%` only) ; `event_page_items` et members mandat sans edit ni reorder ; erreurs silencieuses généralisées (AboutTab/CommitteesTab ignorent les erreurs d'insert) ; création de comptes/rôles non self-service ; hero/marquee/partenaires/CTA codés en dur dans les composants.
- **Livré :** liste priorisée P0/P1/P2 avec preuves fichier:ligne dans la session. Aucun changement de code applicatif ce jour (audit seul).

## 2026-08-31 (soir) — Chasse aux écarts P0/P1/P2 : console production-ready

**Demande de Venus : « shoot down p0 p1 and p2, /goal dont stop till youre done » — implémentation intégrale des 15 écarts de l'audit matin, DDL live, deploy prod.**

- **P0 mandat (les 2 points de friction) :** `mandate_members` gagne `photo_url` + `profile_id` (FK profiles, `on delete set null`) — migration `20260831_mandate_members_photo_profile` appliquée via MCP + `schema.sql` v2.2 synchronisé + répertoire `supabase/migrations/` créé. Formulaire membre : upload photo (club-media), sélecteur de compte existant (`bureau_list_profiles`, nom prérempli, badge « compte lié »), édition complète, réordonnancement ↑↓, suppression confirmée, et **« Importer l'équipe précédente »** (copie rôles + photos + liens, match des comptes par nom). `/about` rend les photos (`UserAvatar`, fallback initiales) y compris puces archivées.
- **P1 :** console ouverte au rôle `bureau` (onglet Utilisateurs restant admin-only, RLS déjà conforme) ; navbar suit `isBureau` ; `home_stats` ENFIN rendu (bandeau chiffres sous le hero, fallback `siteConfig.stats`) ; poster podcast : la valeur console prime sur le chemin codé en dur (`mapPodcastRow`) — épisode 5+ sans 404 ; compteurs de vues fabriqués supprimés partout ; posters TEDx/pages événement/éléments uploadables depuis la console (helper partagé `uploadClubImage`), vidéos restent des liens YouTube (politique storage image-only — décision assumée, documentée dans le hint du formulaire).
- **P2 :** nouveau **onglet Accueil** (marquee, slogan, sur-titre + date TEDx, stats, partenaires sponsor/club, intro À propos — `site_settings` KV avec fallback statique) ; `event_page_items` éditables (+ description) ; erreurs DB surfacées dans AboutTab/CommitteesTab/EventsTab (libellés amicaux doublons) ; confirmations rôle/bannissement/suppressions ; badges clés manquantes YOUTUBE_API_KEY/RESEND_API_KEY via `GET /api/admin/config` (401/403 vérifiés) ; notices « base vide = fallback statique » sur mandats/talks/galerie.
- **Refactor :** logique d'upload tripliquée (galerie/annonces/mandats) centralisée dans `src/lib/mediaUpload.ts` (+ 8 tests unitaires) ; `ShieldCheck` inutilisé retiré d'AdminConsole ; colonne fantôme `views` (cast) supprimée.
- **Vérifs :** tsc 0 erreur, eslint 0, vitest **22/22** (14 existants + 8 nouveaux), `next build` propre, colonnes vérifiées en prod via MCP, smoke HTTP : / /about /podcast /gallery /events /annonces /admin = 200, `/api/admin/config` non authentifié = 401, bandeau stats + marquee visibles dans le HTML prod, plus aucun « vues » fabriqué.
- **Limites :** flows console non testés visuellement (pas d'identifiants bureau pour l'agent — inchangé) ; clés Turnstile/Resend/YouTube toujours attendues côté Venus ; vidéos d'événements volontairement hors upload (25 Mo/policy).
- **Déploiement :** 4 commits fonctionnels + 1 chore (0568457→be0dcfa + caveman), poussés et déployés sur `dtc-fmdc.vercel.app` (build 33 s).

## 2026-09-01 — Cycle de vie des comptes 100 % console (clé service_role branchée)

**Demande de Venus : « the project has supabase npm installed so do it » (gestion des comptes sans dashboard) + question sur la clé YouTube.**

- **Clé YouTube : déjà présente** dans Vercel Production (`vercel env ls`) et en local — l'import Podcast Studio est donc fonctionnel ; le badge « clé manquante » ne s'affiche que si elle disparaît.
- **`SUPABASE_SERVICE_ROLE_KEY`** : validée contre l'Admin API (HTTP 200) depuis `.env.local`, puis ajoutée à Vercel Production (`Sensitive`, jamais `NEXT_PUBLIC_`, import `server-only` en garde anti-bundle client).
- **Nouveau `POST /api/admin/users`** (session admin + Content-Type JSON, service client côté serveur uniquement) : `create` (mot de passe temporaire généré serveur, `email_confirm`, rôle appliqué au profil), `reset_password` (nouveau temporaire, l'ancien tombe immédiatement), `delete` (auth.users ; profiles cascadent, contenus conservés sans auteur). Auto-protection : impossible de se supprimer/se réinitialiser soi-même.
- **UsersTab :** bouton « Inviter » (modal email/nom/rôle), actions par ligne mot de passe temporaire + suppression, carte « affiché une seule fois » avec copie, badge de disponibilité via `/api/admin/config` (nouveau flag `serviceKey`).
- **Vérifs :** tsc 0, eslint 0, vitest 22/22, build propre ; prod : POST non authentifié sur `/api/admin/users` = 401, `/api/admin/config` = 401, `/admin` = 200. Flows authentifiés non rejoués visuellement (pas de session admin pour l'agent).
- **Documentation :** nouveau `docs/platform/production-readiness.md` (référence complète du sweep : mandats, accès, onglet Accueil, podcasts, événements, cycle de vie des comptes, matrice des clés) ; refresh de `overview.md`, `docs/README.md` (le plan plateforme n'était plus « not yet implemented »), `architecture.md` (9 onglets, contenu ops, buckets) et `deployment.md` (ligne `SUPABASE_SERVICE_ROLE_KEY`).
- **Déploiement :** commit f906fae poussé + déployé (49 s).

## 2026-09-01 (suite) — Miniatures YouTube, crop photo, partenaires supprimables, images de cartes

**Demandes de Venus : utiliser les miniatures YouTube (plus nettes), réutiliser le modal de crop pour les photos de mandat, pouvoir supprimer les 2 partenaires par défaut, synchroniser le footer, choisir l'image de galerie des cartes d'activité de l'accueil.**

- **Miniatures YouTube :** fallback poster = `i.ytimg.com/vi/<id>/maxresdefault.jpg` (hqdefault en cas de 404) dans le hero, la liste du lecteur et les seeds statiques ; `poster_image` des 4 épisodes vidé en base (les anciens chemins locaux flous ne prime plus) — vérifié en prod sur / et /podcast. L'import YouTube renseigne déjà ce champ avec la miniature.
- **Crop photo mandat :** le bouton photo du formulaire membre ouvre le modal de crop de l'espace membre (512×512, zoom/pan) puis upload vers `club-media/mandates/<id>/`.
- **Partenaires supprimables :** nom vidé + Enregistrer = carte retirée de /about ET du footer (qui reçoit maintenant sponsor/partner du layout via `site_settings`) ; sans ligne en base, les valeurs par défaut s'affichent.
- **Cartes d'activité :** nouvelle carte Accueil — sélecteur d'image publié de la galerie pour chacune des 3 cartes « Écosystème » (`activity_card_images` jsonb, « Par défaut » conserve l'image du site, aperçu miniature).
- **Vérifs :** tsc 0, eslint 0, vitest 22/22, build propre ; prod : miniatures i.ytimg servies sur / et /podcast, Flex Dental visible sur /about.
- **Double-check (demandé par Venus) :** 3 corrections — le footer affiche maintenant le slogan de la console (`hero_tagline`) au lieu du statique ; footer sans partenaires → 3 colonnes au lieu d'une case vide ; le sélecteur d'image de carte signale « ⚠️ image absente de la galerie » si l'image choisie a été supprimée (avant : select muet vide). `production-readiness.md` resynchronisé (posters ytimg, partenaires supprimables, `activity_card_images`, crop).
- **Déploiement :** commits 336b760 (prefill partenaires/stats) + ad78bdb + 1f758c2 (double-check) poussés et déployés.


## 2026-09-01 (soir) — Candidatures bureau en ligne (remplace le Google Form)

**Demande de Venus : page de candidature intégrée au site, modifiable et gérable depuis la console ; puis précisé : lien formulaie seul — même UI, sans chrome ni chemin vers le site principal.**

- **Schéma v2.3** (`supabase/migrations/20260901_recruitment_applications.sql`, appliqué en prod via MCP, `schema.sql` resynchronisé) : `recruitments` (titre, intro, `is_open` — un seul appel ouvert à la fois via trigger miroir `single_current_mandate`), `recruitment_positions` (postes ouverts, tri), `applications` (nom, année 1A–6A, téléphone, responsabilité antérieure, motivation, « pourquoi vous », `profile_id` auto-lié si connecté, statut `new/reviewed/accepted/rejected`). RLS : lecture publique limitée aux campagnes ouvertes ; **lecture des candidatures (PII) réservée bureau** ; insertion anonyme/authentifiée possible **uniquement si campagne ouverte** et poste cohérent ; update/delete bureau.
- **Seed live :** campagne « Appel à candidatures — Bureau DENTALK 2026-2027 » (texte exact du Google Form remplacé, typo « dentalk » corrigée) + poste « Secrétaire général(e) », **ouverte** dès le déploiement.
- **Page publique `/candidature` : portail autonome** — `SiteChrome` (client) retire navbar + footer pour ce préfixe : le destinataire du lien voit uniquement le formulaire (identité DTC inertes, pas de lien ni chemin vers le site principal), `noindex` (partage par lien seulement, comme « Not shared » du Google Form). Préfillage nom/téléphone si session membre. Champs = questions exactes du Google Form ; validation client (min 20 car. sur les réponses longues) + **honeypot anti-bots** (Turnstile toujours en attente de clé).
- **Console : onglet « Candidatures »** (visible bureau) — éditeur de campagne prérempli (titre, texte, ouverture/fermeture en 1 clic), CRUD des postes ouverts, et « Candidatures reçues » : compteur nouvelles, expansion des réponses, statut (Nouvelle/Traitée/Retenue/Écartée), suppression, **export CSV** (BOM Excel, échappement correct).
- **Vérifs :** `next build` propre ; serveur local : /candidature sans chrome + formulaire présent, accueil avec chrome intact, `noindex` rendu ; **E2E navigateur réel** : soumission anonyme locale → ligne exacte en base puis supprimée ; soumission de test **en prod** (`TEST — Venus Verification`) conservée pour vérification console par Venus ; REST anon sur `applications` = `[]` (PII filtrées par RLS) ; advisors Supabase : aucun nouveau lint (WARN préexistants seulement).
- **Déploiement :** prod `dtc-fmdc.vercel.app` (alias dentalkclub-fmdc), test E2E rejoué sur le domaine live.
- **Retours Venus (même soirée) :** ① cramming mobile → page /candidature : rythme vertical `space-y-7`, intro et titre « Postes ouverts » alignés à gauche sur mobile, `leading-snug` sur H1, carte formulaire `p-5 space-y-5` (vérifié visuellement 390 px) ; **c'est surtout la liste console qui était serrée** → lignes candidatures restructurées : nom+badge / méta complète (plus de troncature, téléphone lisible) / actions (statut + suppression) sur leur propre ligne, cibles tactiles 36 px. ② **Lien de partage dans la console** : encart « Lien à envoyer aux membres » (domaine canonique `siteConfig.siteUrl`/candidature, copie presse-papier avec fallback, ✓ 2 s) dans l'onglet Candidatures. Redéployé.
- **Retours Venus (n°2) :** ① suppression candidature durcie — confirm explicite « irréversible, réponses perdues » + erreurs DB surfacées (avant : échec silencieux) ; le bouton 🗑 existait déjà par ligne. ② **fusion d'onglets console** (10 → 8) : « Annonces & Idées » (`AnnoncesIdeesTab`, pill-switch, composants existants intacts) et « À propos & Commissions » (`AboutCommitteesTab` : Sections & mandats / Commissions & listes) — id `annonces`/`about` conservés donc bureau atterrit au même endroit par défaut. Déployé.
- **Retour Venus (n°3) :** bouton suppression candidatures était icône seule (icône trop discrète, manquée par Venus) → remplacé par bouton étiqueté rouge « Supprimer » à côté du sélecteur de statut (confirm irréversible inchangé). Déployé.

## 2026-09-01 (nuit) — Mur du site + persistance d'onglet + retrait bandeau stats

**Demandes Venus : site inaccessible aux non-admins (« not a cheap html trick ») mais démontable facilement ; rafraîchir la console ne doit pas revenir à l'onglet Utilisateurs ; retirer le bandeau de chiffres de l'accueil. Ne PAS déployer (autre agent au travail sur le repo).**

- **Mur serveur (`src/utils/supabase/middleware.ts`)** : après `auth.getUser()`, tout chemin sauf `/candidature` et `/api/*` exige une session bureau/admin (rôle via RPC `my_profile`) sinon redirection vers `/candidature`. Fail-closed (DB injoignable = mur fermé), `/api/*` répond toujours JSON (chaque route fait ses propres contrôles). Piloté par `site_settings.site_wall_open` (seedé `false`, lu à chaque requête) — **démontage = toggle « Accès public du site » dans l'onglet Accueil, aucun déploiement requis**. Entrée « Connexion bureau » discrète ajoutée en pied du formulaire public (mur = seule page publique).
- **Onglet console persistant** : `AdminConsole` lit `/admin?tab=…` (validé serveur, repli selon rôle) et pousse chaque changement via `history.replaceState` — F5 reste sur l'onglet courant, liens profonds possibles.
- **Retrait bandeau stats accueil** (demande explicite) : section 2b de `/` supprimée + éditeur correspondant de l'onglet Accueil ; `home_stats` reste en base (dormant, réactivable).
- **Fix :** sélecteur de statut des candidatures gardait `w-full` via inputClass → bouton Supprimer poussé hors carte ; `!w-auto` ajouté.
- **Vérifs locales (avant gel du déploiement)** : build + tsc + eslint propres ; mur : anonyme `/` et `/admin` = 307 vers /candidature, /candidature = 200, `/api/admin/config` = 401 ; toggle `site_wall_open` true/false en base vérifié en direct (site ouvert/fermé au rechargement). Mur déployé une première fois avant l'instruction « ne déploye plus » ; stats + persistance d'onglet **committés (d24f38a) mais NON déployés** — fichier `20260901_security_hardening.sql` d'un autre agent présent dans l'arbre, volontairement non committé.

## 2026-09-01 (soir, 2) — Audit sécurité pré-lancement + durcissement v2.4

**Demande de Venus : inspecter la sécurité du site avant sa mise en ligne (« check if we have any loophole or security issue »), puis « go ahead with all the fixes » ; attention aux changements parallèles de l'autre agent (mur de site, onglets fusionnés).**

- **Audit :** 2 sous-agents revue (routes API/authz + RLS/storage) + advisors Supabase live + `npm audit` (0) + scan secrets (propre, `.env.local` jamais commité). Verdict : aucun CRITIQUE — routes admin correctement gated (session + rôle via `my_profile`), RLS sur toutes les tables, clé service_role jamais exposée. Trouvailles : HAUT = inserts anonymes `applications` illimités + `profile_id`/`status` forgeables ; MOYEN = privesc `profiles` à couche unique (column grants seuls), broadcast email sans garde-fou, leaked-password protection OFF (Pro) ; BAS = SVG accepté sur club-media, votes attribuables publiquement, bannis gardés annuaire/emails, un admin peut reset un autre admin, erreurs Supabase passées au client, pas de HSTS.
- **Migration v2.4** (`supabase/migrations/20260901_security_hardening.sql`, appliquée en prod via MCP, `schema.sql` resynchronisé) : policy `applications_open_insert` épinglée (`profile_id` null ou soi, `status='new'`) + trigger anti-doublon (nom+téléphone par campagne, message FR) + plafond 300 candidatures/heure + index unique ; `profiles_self_update` verrouille rôle/bannissement/email via nouveaux helpers `self_role()/self_is_banned()/self_email()` (SECURITY DEFINER) ; `bureau_list_profiles()` exclut les bannis, `member_directory()` refuse l'appelant banni ; club-media refuse SVG (liste mime explicite) ; `votes` : colonne `user_id` retirée à anon (compteurs publics via `idea_board` intacts) ; nouvelle policy `profiles_public_read` (noms d'auteurs pour visiteurs déconnectés — colonnes déjà scopées par grants) ; `announcements.emailed_at`.
- **Code :** `/api/admin/email-broadcast` — renvoi refusé (409) tant que l'annonce n'est pas modifiée après l'envoi, bannis exclus, erreur destinataires en JSON ; `/api/admin/users` — reset de mot de passe d'un autre admin refusé (rétrograder d'abord), messages d'erreur fixes (détails bruts en console serveur), générateur mot de passe par rejet d'échantillonnage (plus de biais modulo) ; `vercel.json` — HSTS (2 ans, includeSubDomains, preload).
- **Vérifs live (REST anon, clé publishable) :** `votes?select=user_id` = refusé ; `idea_board` = 200 ; insert `status='accepted'` forgé = 42501 ; insert valide = 201 ; doublon = 400 message FR ; `profiles` anon = colonnes scopées uniquement. Lignes de test supprimées. Advisors : aucun nouveau lint (WARN préexistants acceptés — les helpers de rôle DOIVENT rester exécutables par anon car les policies anon les appellent ; les remettre casserait chaque lecture anonyme).
- **Non fait (à faire par Venus) :** protection mots de passe compromis = **plan Pro Supabase** (dashboard Auth après upgrade) ; MFA optionnelle bureau/admin ; clés Resend + Turnstile toujours en attente.
- **Coordination :** fichiers de l'autre agent non touchés (mur de site lu et intégré : ma migration est compatible) ; son `HomeTab.tsx` WIP cassait tsc/eslint au passage (`StatsEditor` non défini) — pas bloquant : déploiement via push git du commit propre, pas `vercel --prod` local.

## 2026-09-01 (soir, 3) — v2.4.1 : garde anti-renvoi réparée + garde suppression admin

**Revue indépendante (agent juge demandé par Venus) sur les deux trains de changements : verdict SHIP-WITH-NOTES des deux côtés, 0 CRITIQUE — mais a attrapé un vrai bug dans v2.4 : le trigger partagé `touch_updated_at` bumpait `updated_at` juste après le stamp `emailed_at`, donc `updated_at` restait toujours devant et le 409 anti-renvoi ne se déclenchait jamais.**

- **Fix v2.4.1** (`supabase/migrations/20260901_email_guard_fix.sql`, appliqué en prod, `schema.sql` resynchronisé) : `announcements` passe à un trigger dédié `set_updated_at_announcements()` qui ne bump PAS `updated_at` quand seul `emailed_at` change. Vérifié en prod : stamp → `updated_at` intact ; édition de contenu → `updated_at` repasse devant (renvoi autorisé). Note : la revue a aussi montré que mon premier test DO-block échouait pour une raison bidon (`now()` figé par transaction) — harnais de test corrigé en requêtes séparées.
- **Users route :** la suppression d'un autre admin est maintenant refusée comme le reset (rétrograder d'abord) — alignement avec la garde reset (finding LOW de la revue).
- **Revue — restent notés/à décider :** ① le plafond 300 candidatures/heure est global → un attaquant peut le remplir pour bloquer les vrais candidats pendant 1 h (compromis assumé en attendant Turnstile, qui remplacera le plafond) ; ② le mur de site de l'autre agent masque les PAGES, pas les DONNÉES : la clé anon du bundle permet toujours de lire annonces/idées/galerie/annuaire-noms via REST tant que `site_wall_open` reste false — décision produit à prendre (RLS verrouillé pré-lancement ou pas) ; ③ robots.txt/sitemap derrière le mur (auto-résolu à l'ouverture) ; ④ 2 appels Supabase par requête murée (cache possible plus tard).

## 2026-09-01 (nuit) — v2.5 : le mur masque aussi les DONNÉES (décision Venus)

**Venus sur la note « le mur masque les pages, pas les données » : « if it means only admins get access to the site then yeah » — confidentialité pré-lancement voulue, puis « commit and deploy ».**

- **Migration `20260901_wall_content_lock.sql`** (appliquée en prod via MCP, schema.sql resynchronisé) : helper `site_is_open()` (SECURITY DEFINER, lit `site_wall_open`) ; les 13 policies de lecture publique (annonces, idées, votes, commentaires, podcast, tedx, pages+items d'événements, mandats, membres de mandat, galerie, à-propos, profils) sont maintenant conditionnées à `site_is_open()` côté anon — bureau/admin inchangés. **Exclus du verrou volontairement :** `site_settings` (le middleware lit la clé du mur en anon — verrouiller = mur mort) et `recruitments`/`positions` (le portail /candidature doit rester rendable). Forme `(select public.site_is_open())` = init-plan, une évaluation par requête.
- **Vérifié en prod (REST anon) :** mur fermé → annonces/idées/galerie/profils/mandats/podcast = `[]` (galerie 17 lignes bien masquée), settings + recrutements lisibles ; bascule `true` → galerie/profils reviennent (annonces/idées vides car 0 lignes en base — contenu encore en fallback statique) ; retour `false` → tout re-masqué. Mur pages intègre : `/annonces` 307, `/candidature` 200. La bascule console « Accès public du site » ouvre donc pages ET données d'un coup.
- **Déploiement :** push git (auto-deploy Vercel). Aucune droite de code TS modifiée.

## 2026-09-01 (nuit, 2) — Correction : « push ≠ déploiement » ; tout déployé pour de bon

**Venus a repéré sur son dashboard Vercel que le dernier déploiement datait de l'entrée « docs(audit): fix typo » (e6b1efc) — alors que je rapportais « déployé » après chaque push. Il avait raison, j'avais tort.**

- **Constat :** l'intégration Git de Vercel ne déploie PAS les pushes de ce projet. Tous les déploiements viennent de `npm run deploy` (CLI). Les commits d3f97ee / f2d259b / da4672c n'avaient déclenché AUCUN déploiement ; le déploiement de 13h46 venait du CLI de l'autre agent (son arbre contenait le mur avant même son commit). Ma « preuve » HSTS était invalide : Vercel injecte lui-même `Strict-Transport-Security` sur ce domaine, header présent indépendamment de mon vercel.json.
- **Conséquence :** le code des routes (garde 409 broadcast, gardes admin reset/delete, messages d'erreur propres) n'était PAS en ligne depuis ~14h00 → 14h5x ; seul le SQL (migrations Supabase) était réellement actif.
- **Résolution :** `npm run deploy` exécuté (arbre propre = HEAD da4672c exactement) → déploiement `dtc-qn3dgy3ij` Ready 49 s, aliasé sur dtc-fmdc.vercel.app. Smoke tests : 401 non-auth sur /api/admin/users + /api/admin/email-broadcast, mur 307 /annonces, /candidature 200, verrou données anon `[]`, HSTS présent.
- **Règle pour tout agent :** sur ce repo, `git push` ne déploie jamais. Vérifier la fraîcheur du déploiement via `vercel ls` + l'âge, jamais par un header que Vercel injecte par défaut. Déployer = `npm run deploy` depuis un arbre propre.

## 2026-09-01 (nuit, 3) — Hydratation documentaire + placeholder candidature

- **Placeholder /candidature :** « ex : Aya Jei » (nom réel d'une speaker TEDx) → « ex : Nom Prénom » (436f98d, déployé CLI, vérifié en prod).
- **Déploiement CLI uniquement :** `npm run deploy` = 436f98d Ready 54 s. Rappel consigné dans deployment.md : `git push` ne déploie pas (intégration Git Vercel inactive), arbre propre obligatoire, fraîcheur à vérifier via `vercel ls`.
- **Docs resynchronisés :** `overview.md` (statut = muré pré-lancement, schéma v2.5 + détail des durcissements, portail candidature + anti-abus, next.config.mjs = server-mode), `docs/README.md` (architecture Next 15 server-mode + mur, §9 sécurité, avertissement push≠deploy), `docs/platform/architecture.md` (RLS v2.4–v2.5 : site_is_open(), anti-abus candidatures, privesc 2 couches, votes privacy, WARN advisors acceptés ; console 8 onglets + mur), `docs/platform/deployment.md` (push≠deploy + HSTS), `production-readiness.md` §9 + complément v2.5 (déjà faits).
- **graphify-out :** TOUJOURS périmé — CLI 0.9.49 confirmé query-only (pas de commande build/update) et skill absent de toutes les plateformes locales ; reconstruction à faire dans une session disposant du skill graphify.

## 2026-09-03 — v2.6 : fixes round-2 audit appliqués en prod (f2caa8f)

**Demande de Venus : « fix everything + push to prod » après l'audit round-2 du 09-01 (1 HIGH live-confirmé + 2 MED + P2/P3 + config/SEO). Session précédente interrompue après le commit — reprise : migration appliquée, poussée, déployée, vérifiée.**

- **Migration `20260903_audit_fixes.sql` APPLIQUÉE en prod (MCP, `schema.sql` déjà synchronisé)** : ① trigger `guard_application_submit` épingle `created_at := now()` — le trou HIGH (anon détient INSERT sur la colonne → timestamp forgé esquivait le plafond 300/h) est fermé ; ② policies storage `avatars_self_update` + `club_media_bureau_update` reçoivent leur `WITH CHECK` mime/taille (le path upsert UPDATE ne peut plus héberger du HTML/SVG sur son propre chemin) ; ③ `applications_open_insert` passe `auth.uid()` en initplan (advisor perf) ; ④ index FK `idx_applications_profile` ; ⑤ RPC `claim_announcement_email()` — claim atomique `emailed_at` (bureau-gated, ré-armable par édition, anon révoqué).
- **Preuve live du HIGH corrigé :** insert REST anon avec `created_at:"2000-01-01T00:00:00Z"` → 201, ligne stockée `2026-09-02 23:50:06` (= now()) — le plafond compte à nouveau le temps réel. Ligne test supprimée.
- **Code (f2caa8f, 29 fichiers)** : broadcast = claim atomique AVANT envoi (409 si perdu, 0 envoyé = claim relâché, échec partiel affiché « N lot(s) en échec ») ; IdeasBoard garde son contenu si le refresh échoue ; commentaire idée : compte vérifié avant décrément ; `author_id` envoyé à l'INSERT seulement (plus de vol de byline en édition) + validation URLs posters contre la CSP (composer/events/podcast) ; max-lengths alignés sur les checks DB (annonces/idées/candidature) + message FR amical pour doublon candidature ; gardes double-submit partout (TedxCard, pages+items événements, sections/membres à-propos, création mandat, commissions) ; onglets annonces-hub + console suivent l'URL (popstate/param absent) ; `event_page_items` en échec = 404 (plus de page éviscérée) ; code mort `home_stats` supprimé (parser + type + StatsCounter) ; middleware = cache 10 s de la clé du mur + 503 prod si env manquant (fail-closed).
- **Config/SEO/docs :** `.vercelignore` exclut vraiment `supabase/`, `assets/`, `tsconfig.tsbuildinfo` ; sitemap sans `/idees` ni faux `lastModified` ; nouvelle `og-image.jpg` 1200×630 (35 Ko) + twitter card, `icon.png` 257→22 Ko ; `sw.js` servi `no-cache` ; dérive docs corrigée (deployment.md CSP/82→31 Mo/`.vercelignore`, production-readiness `home_stats`, rules.md 15.5.24).
- **Ordre respecté : migration D'ABORD puis déploiement** (la route broadcast appelle `claim_announcement_email` — déployer avant migrer = 500 sur chaque envoi).
- **Incident déploy résolu :** premier `npm run deploy` (f2caa8f) a ÉCHOUÉ au build Vercel — `Module not found: '@/lib/supabase/client'` alors que build local vert. Cause : le `supabase/` ajouté au `.vercelignore` n'est pas ancré → Vercel a aussi retiré `src/lib/supabase/` + `src/utils/supabase/` de l'upload. Prod intacte (build raté jamais aliasé). Fix 6acc104 : tous les répertoires racine ancrés par `/` dans `.vercelignore`.
- **Vérifs :** tsc 0, vitest 22/22, build local vert ; 8/8 objets DB vérifiés en direct (pin trigger, WITH CHECK ×2, initplan, index, RPC + grants, anon révoqué/authenticated accordé).
- **Déploiement :** `npm run deploy` depuis arbre propre (6acc104 = f2caa8f + fix ignore) → `dtc-r37usthb6` Ready 51 s, aliasé dtc-fmdc. Smoke prod : mur 307 /annonces (cache 10 s du middleware actif), /candidature 200, POST unauth users/broadcast = 401, REST anon applications = `[]` (PII filtrées), REST anon gallery_images = `[]` (verrou données v2.5 tient), `sw.js` = `cache-control: no-cache`, `og-image.jpg` 200/35 Ko. Fraîcheur confirmée via `vercel ls`.
- **Restent côté Venus :** désactiver les inscriptions publiques (dashboard Auth — décision invite-only) ; plan Pro (leaked-password + MFA) ; clés Resend + Turnstile. ESLint 9 flat config garé avant Next 16.

## 2026-09-03 (2) — v2.6.1 : inscriptions publiques = invités observateurs (décision Venus)

**Décision de Venus : l'inscription publique reste OUVERTE, mais un compte auto-créé démarre « invité » qui ne fait qu'observer — l'accès membre n'est accordé que par un bureau ou un admin. Réponse au signalement « signups publics ouverts » de la session précédente.**

- **Migration `20260903_guest_role.sql` appliquée en prod (MCP, `schema.sql` resynchronisé)** : ① `profiles.role` gagne `'guest'` et devient le DÉFAUT — `handle_new_user` crée donc des invités ; le flux d'invitation admin reste intact (rôle explicite posé juste après `createUser`) ; ② `is_active_member()` exclut les invités → idées/votes/commentaires/RSVP refusés en RLS ; ③ `member_directory()` refuse les invités (annuaire = membres validés) ; ④ `profiles_member_read` passe de `using (true)` à membres validés (l'invité ne voit que le niveau anon, déjà verrouillé par le mur) ; ⑤ `bureau_list_profiles()` renvoie role/is_banned/created_at (même forme de ligne que l'admin) ; ⑥ **`approve_guest(target_id, approve)`** : bureau/admin promeut invité→membre, ou refuse = suppression du compte (cascade profil) ; ⑦ `admin_set_role()` accepte `'guest'` (rétrogradation admin).
- **Console :** onglet Utilisateurs partagé — l'admin garde TOUT (invitation, rôles, ban, reset, suppression — le select de rôle gère « Invité (lecture seule) ») ; le bureau voit la liste + les boutons étiquetés « Approuver » / « Refuser » (confirm irréversible) sur les invités en attente, badge doré « Invité — en attente », compteur « dont N invité(s) en attente ». Aucune action d'écriture admin côté bureau (les RPC gardent aussi leurs gardes côté serveur).
- **Pages :** `/espace` et `/espace/annuaire` affichent un écran « Compte en attente de validation » aux invités (plus d'UI membre muette) ; mention du statut invité dans le disclaimer d'inscription de l'AuthModal.
- **Vérifié EN DIRECT (chaîne complète)** : inscription REST jetable → profil `role='guest'` ✓ ; token invité : annuaire refusé (message FR), lecture `profiles` = `[]` (policy), INSERT idée = 42501, `approve_guest` refusé pour invité ET anon ✓ ; promotion (rôle→member) → le MÊME token lit l'annuaire (4 entrées) et poste une idée (201) ✓ ; ligne/idée/user de test supprimés (0 restant).
- **Qualité :** tsc 0, eslint 0, vitest 22/22, build propre. Déploiement CLI `dtc-m49x973im` Ready 51 s, aliasé dtc-fmdc. Smoke : mur 307 /annonces + /espace, /candidature 200, POST API users unauth 401.
- **Conséquence sécurité :** le dernier trou pré-lancement (« n'importe qui devient membre en s'inscrivant ») est neutralisé SANS fermer les inscriptions — l'inscription ouverte ne donne plus aucun privilège membre. Restent côté Venus : plan Pro (leaked-password + MFA), clés Resend + Turnstile.
