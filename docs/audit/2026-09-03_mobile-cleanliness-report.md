# Mobile Cleanliness Audit — 2026-09-03

**Scope:** prod `https://dentalkclub-fmdc.vercel.app`, emulated mobile viewport 390×844 (touch), logged in as temp admin.
**Method:** per-page horizontal-overflow probe (documentElement scrollWidth + per-element rects, scroll-container aware), 17 full-page/viewport screenshots, independent judge-agent visual pass, console sweep, tap-target probe, overlay tests (gallery lightbox, TEDx video modal, hamburger nav).
**Result: 16/17 views pass. 1 real defect found. No fixes applied — standing by for go.**

## Confirmed defect (fix candidate)

### 1. Admin › Utilisateurs — account-card text column crushed to ~7px (HIGH for admin UX)
- On every account card the name / email / « Inscrit … » block collapses to one character per line at 390px. All 4 cards affected. Any bureau member with Users-tab access hits this on their phone.
- Root cause: `src/components/admin/UsersTab.tsx:466` — text column is `min-w-0 flex-1` inside `flex flex-wrap items-center` (line 461). The action cluster (role select + bannir + mot de passe + supprimer buttons) + 38px avatar consume the row; `min-w-0` lets the text column shrink to ~7px instead of forcing the flex row to wrap.
- Fix plan: give the text column a real min width (e.g. `min-w-[140px]`) or push the action cluster to its own full-width row on small screens. Verified by in-browser measurement, not just screenshot.

## Minor (low priority)

2. **Tap targets below 24px.** Footer nav links measure 15px tall, inline content CTAs (« Voir les ateliers », « Découvrir les formats ») 17px tall — under the WCAG 2.5.8 24px minimum. Header « Mon espace » is 32×32 (acceptable-ish). Suggest padding/y-spacing pass, not redesign.
3. **Admin pill tab-strip has no scroll affordance.** Horizontally scrollable strip (intentional, page-level overflow correctly contained) but no edge fade/arrow — on 390px users see pills cut mid-word with no hint more exist.

## Ruled out (false positives from capture method)

- **« Huge blank bands » on home/about/events/podcast** — `Reveal.tsx` IntersectionObserver fade-ins (opacity 0 until 12% in view) never trigger in a full-page capture. Real scrolling shows them; not a defect.
- **Gallery « black tile »** (Grande Finale & Clôture) — lazy-load artifact; `/media/awards/grand_finale_group.jpg` returns 200 / 115 KB and the image content is a normal photo.

## Clean across the board

- Zero horizontal page overflow on: `/`, `/about`, `/annonces` (+`?tab=idees`), `/events`, `/gallery`, `/podcast`, `/candidature`, `/espace`, `/espace/annuaire`, `/admin` (users/home/candidatures tabs).
- Gallery lightbox and TEDx video modal: fit 390px, correct iOS-safe body lock (`position:fixed` via `useOverlayDialog`), close fine.
- Hamburger nav open state: no overflow, all links reachable.
- Console: no errors; only benign font-preload warnings.

## Observations (not bugs)

- `/admin?tab=<key>` silently falls back to the Users tab for unknown keys (`applications` is invalid; valid: `users, home, membership, annonces, podcast, events, gallery, about, candidatures`).
- Podcast ep-3 (vertical 360×640 source) stays in a 16:9 iframe — YouTube letterboxes it; acceptable.

## Test artifacts / cleanup pending

- Screenshots: `/tmp/dtc-mobile/01–16*.png`.
- Temp admin account left in DB for post-fix verification: `mobile-audit2.tmp@dtc-audit.local` (profile id `b524bff9-cc7a-4ecb-8c66-fbbac0b76a8f`, role admin). **Delete after fix round.** (First hand-inserted auth user attempt was removed already; GoTrue admin API is the correct way to create users — SQL insert into `auth.users` misses `auth.identities` and 500s on login.)
- Note: working tree was already dirty before this audit (`M src/lib/types.ts`, untracked `20260903_membership_flow.sql`) — not touched.
