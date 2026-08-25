# Graph Report - DTC  (2026-08-25)

## Corpus Check
- 112 files · ~98,638 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 501 nodes · 1013 edges · 50 communities (41 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aa3c434d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- compilerOptions
- app/layout.tsx
- GalleryClient.tsx
- getSupabaseBrowserClient
- data.ts
- DTC Website Platform (Next.js 14)
- Instagram Scraper & Synchronization Pipeline: Dentalk Club FMDC
- Instagram Data & Content Analysis: Dentalk Club FMDC
- fetch_all_posts.py
- events/layout.tsx
- gallery/layout.tsx
- next.config.mjs
- next-env.d.ts
- tailwind.config.ts
- vercel.json
- dtc-media-pipeline
- 🚀 DTC Club Platform — Approved Implementation Plan & Session Handoff
- DTC Project Activity Log
- AI Agent Operational Rules & Guidelines for DTC Website
- extends
- createSupabaseServerClient
- Dentalk Club FMDC (DTC) — Project Overview
- types.ts
- 📋 Comprehensive Category Index
- devDependencies
- 🎤 3. Key Milestone Archive
- sw.js
- Q: check out the profile section, use graphify for help
- AnnouncementsFeed.tsx

## God Nodes (most connected - your core abstractions)
1. `getSupabaseBrowserClient()` - 44 edges
2. `useOverlayDialog()` - 26 edges
3. `useAuth()` - 21 edges
4. `createSupabaseServerClient()` - 21 edges
5. `formatRelative()` - 17 edges
6. `isSupabaseConfigured()` - 17 edges
7. `compilerOptions` - 16 edges
8. `inputClass` - 13 edges
9. `withFallback()` - 13 edges
10. `getSiteSettings` - 13 edges

## Surprising Connections (you probably didn't know these)
- `DTC Website Platform (Next.js 14)` --EMBEDS_EPISODES_OF--> `Let's Talk Podcast Series`  [EXTRACTED]
  docs/platform/architecture.md → src/data/podcastData.ts
- `RootLayout()` --calls--> `getSiteSettings`  [EXTRACTED]
  src/app/layout.tsx → src/lib/data.ts
- `AnnoncesPage()` --calls--> `getPublishedAnnouncements()`  [EXTRACTED]
  src/app/annonces/page.tsx → src/lib/data.ts
- `POST()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/api/admin/email-broadcast/route.ts → src/lib/supabase/server.ts
- `POST()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/api/admin/youtube-import/route.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (50 total, 9 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.07
Nodes (26): lucide-react, dependencies, lucide-react, next, react, react-dom, @supabase/ssr, @supabase/supabase-js (+18 more)

### Community 1 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 2 - "app/layout.tsx"
Cohesion: 0.11
Nodes (20): inter, jakarta, metadata, organizationJsonLd, RootLayout(), viewport, AuthProvider(), TedxGrid() (+12 more)

### Community 3 - "GalleryClient.tsx"
Cohesion: 0.24
Nodes (9): GalleryPage(), metadata, CategoryFilter, GalleryClient(), ImageLightbox(), ImageLightboxProps, GalleryItem, galleryItemsData (+1 more)

### Community 4 - "getSupabaseBrowserClient"
Cohesion: 0.08
Nodes (57): AboutTab(), MandatesEditor(), SectionsEditor(), StatsEditor(), TabId, TABS, AnnouncementsTab(), STATUS_LABELS (+49 more)

### Community 5 - "data.ts"
Cohesion: 0.09
Nodes (36): AboutPage(), metadata, EventsPage(), EventLandingPage(), generateMetadata(), Params, IdeesPage(), metadata (+28 more)

### Community 6 - "DTC Website Platform (Next.js 14)"
Cohesion: 0.33
Nodes (6): Full 97-Post Media Library, Dentalk Club FMDC, Faculté de Médecine Dentaire de Casablanca, Let's Talk Podcast Series, Live Deployment (dentalkclub-fmdc.vercel.app), DTC Website Platform (Next.js 14)

### Community 7 - "Instagram Scraper & Synchronization Pipeline: Dentalk Club FMDC"
Cohesion: 0.20
Nodes (9): 🛠️ 1. Architecture Overview, 🔑 2. Authentication & Rate-Limit Bypassing, 📂 3. Utility Scripts Roster, 📋 4. JSON Data Schemas, Active scripts (`scripts/`), Instagram Scraper & Synchronization Pipeline: Dentalk Club FMDC, Podcast Episode Object (`podcasts_catalog.json`):, Retired legacy scripts (`scripts/legacy/`) — target the deleted `data/` tree (+1 more)

### Community 8 - "Instagram Data & Content Analysis: Dentalk Club FMDC"
Cohesion: 0.25
Nodes (4): 📊 1. Account & Timeline Overview, 📈 2. Category & Event Breakdown across 97 Posts, Instagram Data & Content Analysis: Dentalk Club FMDC, 📂 Master Metadata Location

### Community 32 - "🚀 DTC Club Platform — Approved Implementation Plan & Session Handoff"
Cohesion: 0.15
Nodes (13): 10. Supabase MCP — status & known quirks, 11. Out of scope v1 (roadmap only), 1. The vision, 2. Current state of the repo (verify before executing), 3. Architecture (settled), 4. Settled decisions (from the dev Q&A — do not reopen), 5. Database design (`supabase/schema.sql` + `supabase/seed.sql`), 6. Frontend plan (French UI, existing idiom, mobile-first, iOS-safe) (+5 more)

### Community 33 - "DTC Project Activity Log"
Cohesion: 0.20
Nodes (10): 2026-08-24, 2026-08-25 — Club platform implementation (phases A–D, full build), 2026-08-25 — Club platform planning session (no code changes), 2026-08-25 — Full security audit (Vercel + live Supabase + code) & hardening, 2026-08-25 — Independent judge audit + remediation, 2026-08-25 — Major platform pass: Next 15.5 upgrade, review bundles, client caching, gallery/realtime/email features, 2026-08-25 — Production-readiness audit & remediation, 2026-08-25 — Professional-grade security pass #2 (leak sweep, DB hardening, nonce CSP, domain-alias fix) (+2 more)

### Community 34 - "AI Agent Operational Rules & Guidelines for DTC Website"
Cohesion: 0.15
Nodes (12): 10. Client-Side Caching (service worker) Invariants, 1. Core Principles & Philosophy, 2. Environment & Tooling Conventions, 3. Instagram & Media Scraping Rules, 4. Documentation & Knowledge Graph Conventions, 5. WebKit & iOS Safari Compatibility Invariants, 6. Mobile Space-Efficiency Standards, 7. Next.js Deployment Mode & Server Platform (+4 more)

### Community 36 - "createSupabaseServerClient"
Cohesion: 0.11
Nodes (23): AdminPage(), dynamic, metadata, AnnuairePage(), dynamic, metadata, dynamic, EspacePage() (+15 more)

### Community 37 - "Dentalk Club FMDC (DTC) — Project Overview"
Cohesion: 0.29
Nodes (6): 🎯 About Dentalk Club FMDC, 🏛️ Club Platform Layer (2026-08-25), Dentalk Club FMDC (DTC) — Project Overview, 🚀 Key Assets & Data Ready for Web Development, 🌐 Live Production Platform & DNS, 📂 Repository Structure

### Community 38 - "types.ts"
Cohesion: 0.09
Nodes (28): Draft, ROLE_LABELS, AuthModal(), AuthMode, translateError(), Window, AuthContext, AuthContextValue (+20 more)

### Community 39 - "📋 Comprehensive Category Index"
Cohesion: 0.25
Nodes (8): 1. 🏛️ Club Governance & Identity, 2. 💻 Web Platform Engineering, 3. 📸 Media Archives & Data Pipeline, 4. 📜 Audit & History Tracking, 📋 Comprehensive Category Index, 🏛️ DTC (Dentalk Club FMDC) — Master Documentation Hub, 🌐 Live Production Links, 📂 Organized Documentation Structure

### Community 40 - "devDependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+15 more)

### Community 41 - "🎤 3. Key Milestone Archive"
Cohesion: 0.40
Nodes (5): 🎤 3. Key Milestone Archive, Milestone 1: Founding & Inception (October – November 2024), Milestone 2: TEDxFMDC First Edition (November 22, 2025), Milestone 3: Let's Talk Podcast Series (2025–2026), Milestone 4: Executive Governance 2025–2026 (June 2025)

### Community 42 - "sw.js"
Cohesion: 0.70
Nodes (4): cacheFirst(), networkFirstNavigation(), staleWhileRevalidate(), trimCache()

### Community 43 - "Q: check out the profile section, use graphify for help"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: check out the profile section, use graphify for help, Source Nodes

### Community 44 - "AnnouncementsFeed.tsx"
Cohesion: 0.09
Nodes (30): AnnoncesPage(), metadata, BroadcastEmailRow, dynamic, emailHtml(), POST(), dynamic, POST() (+22 more)

## Knowledge Gaps
- **176 isolated node(s):** `next/core-web-vitals`, `nextConfig`, `name`, `version`, `private` (+171 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseBrowserClient()` connect `getSupabaseBrowserClient` to `app/layout.tsx`, `AnnouncementsFeed.tsx`, `types.ts`, `createSupabaseServerClient`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `isSupabaseConfigured()` connect `createSupabaseServerClient` to `app/layout.tsx`, `getSupabaseBrowserClient`, `data.ts`, `types.ts`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `useOverlayDialog()` connect `getSupabaseBrowserClient` to `app/layout.tsx`, `GalleryClient.tsx`, `AnnouncementsFeed.tsx`, `types.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `nextConfig`, `name` to the rest of the system?**
  _176 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `app/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10984848484848485 - nodes in this community are weakly interconnected._