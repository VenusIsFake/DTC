# AI Agent Operational Rules & Guidelines for DTC Website

This document defines the rules, conventions, and operational standards for AI agents contributing to the **DTC (Club Website)** repository.

---

## 1. Core Principles & Philosophy
1. **Modularity & Maintainability:** Write clean, modular, and well-documented code. Avoid monolith files.
2. **Design & UX First:** Maintain responsive, mobile-first design with high accessibility standards (WCAG compliant) and modern UI aesthetics.
3. **Documentation Driven:** Keep the `/docs` directory updated whenever new architectural decisions, APIs, or features are implemented.
4. **Security & Privacy:** Never hardcode credentials, session cookies, API keys, or private tokens. Always use `.env` files and environment variables.

---

## 2. Environment & Tooling Conventions
- **Python Package Management:** Use `uv` for Python virtual environments and package installations (located in `.venv`).
- **Dependencies:** Document all Python dependencies in `pyproject.toml` or `requirements.txt`. For Node.js / frontend dependencies (when established), use `package.json` with strict lockfiles.
- **Git Hygiene:** Maintain clean commit messages and ensure `.gitignore` excludes temporary artifacts, media downloads, session data, and `.venv`.

---

## 3. Instagram & Media Scraping Rules
- **Respect Rate Limits:** When using `instaloader` or social scrapers, incorporate rate-limiting, caching, and fallback states to prevent IP throttling or account blocks.
- **Session Data Protection:** Do not commit Instagram session files (`.session` files or cached cookies) to git.
- **Media Optimization:** Compress or resize fetched media assets before serving on the public website to maintain fast load times.

---

## 4. Documentation & Knowledge Graph Conventions
- **Continuous Documentation:** ALWAYS document every significant change, feature implementation, data scraping session, or architectural decision inside `/docs/`. Maintain an activity log in `/docs/audit/activity_log.md`.
- **Knowledge Graph (graphify):** ALWAYS run and update graphify (`graphify` / `--update`) whenever code, documentation, or structural data changes are made to keep the repository knowledge graph current (`graphify-out/`).
- Keep `overview.md` updated as the high-level summary of the club website's status, features, and roadmap.

---

## 5. WebKit & iOS Safari Compatibility Invariants
- **Zero SSR Opacity Traps:** Never use `framer-motion` initial inline styles (`initial={{ opacity: 0 }}`) for above-the-fold or critical hero content. Always use pure hardware-accelerated CSS keyframe animations (`@keyframes fadeInSlideUp`) with default `opacity: 1` so content is immediately visible on the first paint before hydration.
- **WebKit Scrolling Stability:** Do not place `scroll-smooth` on the root `<html>` tag, as it triggers WebKit momentum scrolling viewport rendering freezes on iOS Safari.
- **Mobile Video Autoplay Policies:** Always equip `<video>` tags with explicit `muted`, `playsInline`, `webkit-playsinline="true"`, and native iOS `webkitEnterFullscreen()` fallback handling to prevent unhandled promise rejections.

---

## 6. Mobile Space-Efficiency Standards
- **No Artificial Viewport Height on Mobile:** Never apply `min-h-[...vh]` (e.g. `min-h-[75vh]`, `min-h-[90vh]`) to mobile hero containers. Allow above-the-fold content to hug naturally (`pt-12 pb-2`) so action buttons and live stats cards stack tightly with zero dead space.
- **Compact Padding Scales:** Use `px-3.5 sm:px-6` and `p-2.5 sm:p-5` on mobile cards to maximize content density on narrow viewports (320px–414px).

---

## 7. Next.js Deployment Mode & Server Platform
- **Server deployment (since 2026-08-25):** the site runs as a standard Next.js server app on Vercel (`npm run deploy` = `vercel --prod --yes`). The static-export `output: "export"` config and the `fast-deploy` prebuilt flow were retired when the club platform (Supabase auth/roles, backoffice, RSVP, ideas) landed — dynamic routes (`/events/[slug]`), server-side YouTube import, and settings-aware rendering require a server runtime.
- **Backend contract:** Supabase (Postgres + RLS + Auth + Storage) is the enforcement layer; the app only reacts to what RLS allows. Public pages must keep their static `src/data` fallback so the site never blanks out when the DB is unreachable.
- **Secrets:** `YOUTUBE_API_KEY` stays server-side (API route only); never prefix it with `NEXT_PUBLIC_`. See `docs/platform/deployment.md` for the full setup checklist.
- **Images:** keep `images: { unoptimized: true }` (remote Supabase/YouTube posters flow through it unchanged); optimization is roadmap.

### ⚠️ 7a. Next.js version policy (updated 2026-08-25 — UPGRADE LANDED)
The project ran `next@14.2.35`, whose unpatched CVEs (Server Actions/rewrites SSRF, cache confusion) had fixes only in 15.5+. **On 2026-08-25 the dev approved and the app was upgraded to `next@15.5.23` + React 19 (currently `15.5.24`) — `npm audit` is now clean and the CVE freeze below no longer applies.**

Current policy:
- Keep the app on patched majors; if `npm audit` surfaces new highs, fix or upgrade promptly — **never** bump to another 14.2.x.
- The historical mitigations (plain `route.ts` handlers, no rewrites, no Server Actions) are now a **design choice, not a security requirement** — Server Actions / rewrites / Edge may be adopted when a feature justifies them, after checking they don't regress the nonce CSP (`src/utils/supabase/middleware.ts`).
- Large upgrades (Next 16, React 20) still require notifying Venus first.

---

## 8. Media Player & Interactive Lifecycle Rules
- **Iframe History Stack Safety:** Always assign `key={item.id}` to dynamic media `<iframe>` embeds (such as YouTube players) to prevent mutating `iframe.src` from hijacking the browser's Back/Forward navigation stack.
- **Modal Scroll Locking:** Always lock the background page scroll (`document.body.style.overflow = "hidden"`) and attach `Escape` key listeners with cleanup inside modal, lightbox, and fullscreen viewer components.
- **Interactive Pan/Drag:** When implementing zoomable visual assets (> 1x zoom), provide smooth mouse (`onMouseDown`/`onMouseMove`) and single-finger touch (`onTouchStart`/`onTouchMove`) drag handlers with boundary reset controls.

---

## 9. Coding Standards
- **File Structure:** Keep logic, components, styles, and utilities separated into designated folders.
- **Type Safety:** Prefer TypeScript for frontend development and type hints for Python scripts.
- **Error Handling:** Always implement graceful degradation and user-friendly error fallbacks (e.g. placeholder UI when live Instagram feeds are unavailable).

---

## 10. Client-Side Caching (service worker) Invariants
The app ships a hand-rolled service worker (`public/sw.js`, registered by `src/components/ServiceWorkerRegister.tsx`, production only) to keep repeat-visitor bandwidth low on the Vercel Hobby plan. It is deliberately **freshness-first**:
- **Navigations are never intercepted or cached** — every page load hits the network directly, so a new production deploy is visible immediately; the SW only serves a static offline page when the network is unreachable. Never cache HTML: Next streams responses, and caching streamed HTML risks broken content swaps.
- **Never cache:** `/api/*` routes, Supabase auth/REST/realtime traffic, non-GET requests, and HTTP `Range` requests (video streaming). Votes, RSVPs and sessions must always be live.
- **Cache-first only for immutable things:** `/_next/static` (content-hashed) and opaque YouTube thumbnails.
- **Stale-while-revalidate** for site `/media` files, icons, and Supabase storage images (served instantly, refreshed in background — a replaced file shows on the second load).
- **Any change to `sw.js` logic requires bumping `VERSION`** in that file so old caches are dropped on activate.
- `next.config.mjs` also sets `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` on `/media/*` and icon files — keep server headers and SW strategy aligned when tuning.
- Serverless functions run in `dub1` (`vercel.json → regions`) to sit in the same region as Supabase (eu-west-1) and close to Moroccan visitors — don't remove this.

---

## 11. Official Administrative Letters & PDF Format Standards
When generating official letters, requests, or administrative documents for the DenTalk Club (DTC):
- **Page Specification:** Strictly single-page A4 portrait (`@page { size: A4 portrait; margin: 18mm 20mm 18mm 20mm; }`).
- **Header Layout:**
  - **Top-Left Logo:** Official combined vector logo `assets/logos/fmdc_uh2c_logo.svg` (height ~60px). Contains UH2C crest, separator, FMDC bold acronym, and university subtitle.
  - **Top-Right Logo:** Official transparent DenTalk Club emblem `assets/logos/dtc_logo.png` (height ~66px).
  - **Header Divider:** 2-tone border rule: solid `#004A81` base with gradient accent overlay (`linear-gradient(90deg, #004A81 0%, #1D939C 50%, #004A81 100%)`).
- **Palette & Typography:**
  - **Primary Academic Blue:** `#004A81` (titles, roles, accents)
  - **Institutional Teal:** `#1D939C` (accent highlights)
  - **Body Text:** `#1a202c` on `#ffffff`, 10.3pt–10.5pt, line-height 1.58–1.62, text-align justified with 1.8em paragraph indents.
  - **Font Stack:** `'Liberation Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
- **Key Sections:**
  - **Expéditeur:** Houssam Fakhout, Président du DenTalk Club, Faculté de Médecine Dentaire de Casablanca (with phone & email).
  - **Destinataire:** Right-aligned header block with date & city underneath (`Casablanca, le [Date]`).
  - **Objet:** Framed callout box (`background: #f8fafc; border-left: 4px solid #004A81;`).
  - **Signature:** Right-aligned centered block with signature clearance (`height: 52px;`).
  - **Footer:** Two-column subtle institutional tagline separated by top rule (`#e2e8f0`).
- **Compilation Tool:** Use Google Chrome headless to compile HTML to PDF:
  ```bash
  google-chrome --headless --disable-gpu --no-pdf-header-footer --print-to-pdf=<dest.pdf> file:///<abs-path-to-html>
  ```

---

## 12. WhatsApp Automation & Project Boundary Invariants
- **Strict Project & Account Isolation:** The DTC WhatsApp subsystem must strictly and exclusively operate in `/home/venus/Projects/DTC/whatsapp` using its dedicated `whatsapp/auth_info/` directory. **NEVER** inspect, read, kill, or access `/home/venus/Projects/Whatsapp Agent`, and **NEVER** access user browser profiles, Firefox/Chrome LevelDB stores, or personal WhatsApp Web sessions.
- **Outbox Idempotency & Pre-Flight Exclusion:** Before any bulk messaging or broadcast, verify recipient lists against sent databases, Supabase statuses, and archived chats. Never re-message confirmed, declined, or already-contacted candidates. Always display a recipient diff and wait for explicit confirmation.
- **Semantic Evaluation over Naive Regex:** Never use simple Python string search (`"merci"`, `"non"`) to classify candidate intent. Always pass full conversational context to an LLM pass to distinguish between confirmations, questions, and polite refusals.
- **Mobile Export Standards:** When exporting contact rosters for manual mobile import, always generate formatted `.vcf` (vCard) files (`dtc + [number/name]`) alongside any CSVs.

---

## 13. Visual Proofing & Standalone Artifact Portability
- **Mandatory Visual Verification:** Never declare a UI change, presentation slide, poster, or PDF document "done" based solely on build success. Always render to PNG (via headless Chrome / `pdftoppm`) and inspect the output using `view_file` to verify alignment, contrast, typography, and layout.
- **Portable Presentation Bundles:** When generating presentation HTML (`presentation.html`) intended for projection or transfer to another PC, inline all critical graphic assets (base64 Data URIs or inline SVG) so the document functions standalone with zero local server or filesystem dependencies.

---

## 14. Physical Stand Onboarding & Campus NAT Invariants
- **Progressive Onboarding:** Never block students in line at an in-person stand behind a rigid email verification wall. Keep new signups logged in in a pending state, display live registration queues, and unlock the payment/mini-game flow upon verification.
- **Campus NAT Rate Limiting:** At physical university events, students share a single public Wi-Fi NAT IP. Never enforce IP-based rate limiting or banning on auth endpoints; rate-limit strictly per target email or user identity.

---

## 15. Vector-First Assets & Workspace Hygiene
- **Vector-First Sourcing:** Treat user-uploaded screenshots as search cues, never production assets. Sourced institutional logos must be authentic vector SVGs (from `vector.ma`, Wikimedia, or official portals), trimmed of excess viewBox whitespace.
- **Container Egress Routing:** Shell `curl` and `urllib` commands time out inside container subshells. Always use `read_url_content` for remote web fetches and REST queries.
- **Project Root Cleanliness:** Never leave test screenshots, intermediate cropped SVGs, or ad-hoc data dumps in the project root. Transient artifacts must be written to scratch directories or removed immediately; persistent campaign dumps belong in `archive/data/`.
