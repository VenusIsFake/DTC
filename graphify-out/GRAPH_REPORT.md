# Graph Report - DTC  (2026-08-27)

## Corpus Check
- 115 files · ~103,321 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 552 nodes · 1076 edges · 48 communities (40 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0c160302`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- compilerOptions
- app/layout.tsx
- GalleryClient.tsx
- client.ts
- Brand Guidelines v1.0 — Dentalk Club FMDC (DTC)
- DTC Website Platform (Next.js 14)
- youtube-import/route.ts
- supabase/middleware.ts
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
- Dentalk Club FMDC (DTC) — Project Overview
- types.ts
- devDependencies
- sw.js
- Q: check out the profile section, use graphify for help
- data.ts
- realtime-e2e-test.mjs

## God Nodes (most connected - your core abstractions)
1. `getSupabaseBrowserClient()` - 44 edges
2. `useOverlayDialog()` - 26 edges
3. `useAuth()` - 21 edges
4. `createSupabaseServerClient()` - 21 edges
5. `formatRelative()` - 17 edges
6. `isSupabaseConfigured()` - 17 edges
7. `compilerOptions` - 16 edges
8. `DTC Project Activity Log` - 16 edges
9. `inputClass` - 13 edges
10. `withFallback()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `DTC Website Platform (Next.js 14)` --EMBEDS_EPISODES_OF--> `Let's Talk Podcast Series`  [EXTRACTED]
  docs/platform/architecture.md → src/data/podcastData.ts
- `GalleryPage()` --calls--> `getGalleryImages()`  [EXTRACTED]
  src/app/gallery/page.tsx → src/lib/data.ts
- `RootLayout()` --calls--> `getSiteSettings`  [EXTRACTED]
  src/app/layout.tsx → src/lib/data.ts
- `SectionsEditor()` --calls--> `getSupabaseBrowserClient()`  [EXTRACTED]
  src/components/admin/AboutTab.tsx → src/lib/supabase/client.ts
- `StatsEditor()` --calls--> `getSupabaseBrowserClient()`  [EXTRACTED]
  src/components/admin/AboutTab.tsx → src/lib/supabase/client.ts

## Import Cycles
- None detected.

## Communities (48 total, 8 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.06
Nodes (30): lucide-react, dependencies, lucide-react, next, react, react-dom, @supabase/ssr, @supabase/supabase-js (+22 more)

### Community 1 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 2 - "app/layout.tsx"
Cohesion: 0.10
Nodes (22): display, inter, metadata, organizationJsonLd, RootLayout(), viewport, AuthProvider(), TedxGrid() (+14 more)

### Community 3 - "GalleryClient.tsx"
Cohesion: 0.26
Nodes (8): GalleryPage(), metadata, CategoryFilter, GalleryClient(), ImageLightbox(), ImageLightboxProps, GalleryItem, galleryItemsData

### Community 4 - "client.ts"
Cohesion: 0.08
Nodes (48): AboutTab(), MandatesEditor(), SectionsEditor(), StatsEditor(), AdminConsole(), TabId, TABS, STATUS_LABELS (+40 more)

### Community 5 - "Brand Guidelines v1.0 — Dentalk Club FMDC (DTC)"
Cohesion: 0.06
Nodes (30): 1. Color Palette, 2. Typography, 3. Logo Usage, 4. Voice & Tone, 5. Messaging Framework, 6. AI Prompting & Image Generation Guidelines, Accessibility Standards, Base Prompt Template (+22 more)

### Community 6 - "DTC Website Platform (Next.js 14)"
Cohesion: 0.33
Nodes (6): Full 97-Post Media Library, Dentalk Club FMDC, Faculté de Médecine Dentaire de Casablanca, Let's Talk Podcast Series, Live Deployment (dentalkclub-fmdc.vercel.app), DTC Website Platform (Next.js 14)

### Community 7 - "youtube-import/route.ts"
Cohesion: 0.36
Nodes (6): dynamic, POST(), YouTubeVideoResponse, EventItemsGrid(), isoDurationToClock(), parseYouTubeId()

### Community 8 - "supabase/middleware.ts"
Cohesion: 0.43
Nodes (4): config, middleware(), securityContext(), updateSession()

### Community 28 - "vercel.json"
Cohesion: 0.50
Nodes (3): dub1, headers, regions

### Community 32 - "🚀 DTC Club Platform — Approved Implementation Plan & Session Handoff"
Cohesion: 0.15
Nodes (13): 10. Supabase MCP — status & known quirks, 11. Out of scope v1 (roadmap only), 1. The vision, 2. Current state of the repo (verify before executing), 3. Architecture (settled), 4. Settled decisions (from the dev Q&A — do not reopen), 5. Database design (`supabase/schema.sql` + `supabase/seed.sql`), 6. Frontend plan (French UI, existing idiom, mobile-first, iOS-safe) (+5 more)

### Community 33 - "DTC Project Activity Log"
Cohesion: 0.04
Nodes (42): 2026-08-24, 2026-08-25 — Club platform implementation (phases A–D, full build), 2026-08-25 — Club platform planning session (no code changes), 2026-08-25 — Full security audit (Vercel + live Supabase + code) & hardening, 2026-08-25 — Independent judge audit + remediation, 2026-08-25 — Major platform pass: Next 15.5 upgrade, review bundles, client caching, gallery/realtime/email features, 2026-08-25 (nuit) — Fil bureau vide + affiches sur les annonces, 2026-08-25 — Production-readiness audit & remediation (+34 more)

### Community 34 - "AI Agent Operational Rules & Guidelines for DTC Website"
Cohesion: 0.15
Nodes (12): 10. Client-Side Caching (service worker) Invariants, 1. Core Principles & Philosophy, 2. Environment & Tooling Conventions, 3. Instagram & Media Scraping Rules, 4. Documentation & Knowledge Graph Conventions, 5. WebKit & iOS Safari Compatibility Invariants, 6. Mobile Space-Efficiency Standards, 7. Next.js Deployment Mode & Server Platform (+4 more)

### Community 37 - "Dentalk Club FMDC (DTC) — Project Overview"
Cohesion: 0.29
Nodes (6): 🎯 About Dentalk Club FMDC, 🏛️ Club Platform Layer (2026-08-25), Dentalk Club FMDC (DTC) — Project Overview, 🚀 Key Assets & Data Ready for Web Development, 🌐 Live Production Platform & DNS, 📂 Repository Structure

### Community 38 - "types.ts"
Cohesion: 0.06
Nodes (64): BroadcastEmailRow, dynamic, emailHtml(), POST(), AnnouncementsTab(), CommitteesEditor(), PromoYearsEditor(), IdeasTab() (+56 more)

### Community 40 - "devDependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+15 more)

### Community 42 - "sw.js"
Cohesion: 0.83
Nodes (3): cacheFirst(), staleWhileRevalidate(), trimCache()

### Community 43 - "Q: check out the profile section, use graphify for help"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: check out the profile section, use graphify for help, Source Nodes

### Community 44 - "data.ts"
Cohesion: 0.07
Nodes (54): AboutPage(), metadata, AdminPage(), dynamic, metadata, AnnoncesPage(), metadata, AnnuairePage() (+46 more)

### Community 50 - "realtime-e2e-test.mjs"
Cohesion: 0.40
Nodes (4): channel, seen, supabase, timeout

## Knowledge Gaps
- **214 isolated node(s):** `next/core-web-vitals`, `nextConfig`, `name`, `version`, `private` (+209 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseBrowserClient()` connect `types.ts` to `app/layout.tsx`, `client.ts`, `data.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `isSupabaseConfigured()` connect `data.ts` to `supabase/middleware.ts`, `app/layout.tsx`, `client.ts`, `types.ts`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `useOverlayDialog()` connect `client.ts` to `app/layout.tsx`, `GalleryClient.tsx`, `types.ts`, `youtube-import/route.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `nextConfig`, `name` to the rest of the system?**
  _214 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `app/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09841269841269841 - nodes in this community are weakly interconnected._