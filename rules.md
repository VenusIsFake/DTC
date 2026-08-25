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

### ⚠️ 7a. Next.js 14.2 unpatched CVEs — STOP & notify the dev (added 2026-08-25)
The project runs `next@14.2.35` — the **last** 14.2 release. npm audit reports 5 high-severity advisories against it (Server Actions SSRF, rewrites SSRF, cache confusion of request bodies, Edge Server Action payloads, internal Server Function disclosure). The fixes exist **only in Next 15.5+**; there will never be a 14.2 patch, and the planned upgrade to 15 has not happened yet.

**Binding rule:** before introducing ANY of the affected features below, the agent MUST stop and warn the dev (Venus) that the feature is in the unpatched CVE surface, and get an explicit go-ahead:
- `"use server"` / Server Actions / form actions (any server mutation pattern that is not a plain `route.ts` handler);
- `rewrites()` or `redirects()` in `next.config.mjs` — especially with dynamic/attacker-influenced destination hostnames;
- cached route handlers or `fetch(..., { cache: ... })` in combination with request bodies (cache-confusion CVEs);
- moving middleware or handlers to the Edge runtime with Server Actions;
- any `next` version bump (must jump to ≥15.5, never another 14.2.x).

Current mitigations that keep us safe today: the app uses none of the features above (plain route handlers, no rewrites, Vercel serverless runtime) — keep it that way until the Next 15 upgrade lands.

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
