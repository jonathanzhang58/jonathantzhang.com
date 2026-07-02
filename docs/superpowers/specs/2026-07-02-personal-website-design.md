# Personal Website — Design Spec

**Date:** 2026-07-02
**Status:** Approved by user (mockup direction 2, revised to multi-page SPA layout)
**Mockup reference:** https://claude.ai/code/artifact/9a204df7-8744-4980-b0ec-4532f03e2c80 (direction 2, "Clean geometric + one accent")

## Overview

A personal website for a PhD student, built as a single-page application that feels like distinct pages: a fixed top nav bar navigates between sections with animated client-side transitions (no browser reloads). The vibe is slightly playful Swiss-geometric: precise layout and hairline lines, with personality carried by motion, pop-in motifs (emphasis lines, star), and a flipping section icon. All text and images are placeholders for now.

## Visual system

- **Background:** near-white `#FDFDFC`
- **Ink (text):** near-black `#17181C`; secondary text `#43454D`
- **Accent:** cobalt `#1440C8` — used for emphasis lines, star, active nav link, kicker arrow, titles line, icon tint (lightened)
- **Grid lines:** hairline `#D4D5DA` diagonals (±45°) forming a sparse diamond grid; one cobalt accent diagonal
- **Typography:** system sans (Arial/Helvetica stack)
  - Display name: uppercase, weight 800, tight letter-spacing (−0.035em), large (~68px desktop)
  - Kicker: `HELLO! I'M ↓` — 13px, weight 700, uppercase, letter-spacing 0.22em, secondary color, cobalt ↓; **44px gap** below it before the name
  - Titles/affiliations: 11.5px uppercase, letter-spacing 0.16em, cobalt
  - Splash/body: regular sentence case, ~16.5px, max-width ~46ch
  - Nav: 11px uppercase, letter-spacing 0.14em
- **Motifs:**
  - Emphasis lines: three short cobalt strokes radiating from the top-left of the name (square linecaps)
  - Star: solid cobalt four-point star at the bottom-right of the name
- **Spacing principle:** generous vertical air between stacked text elements (user preference; err on the roomy side)

## Structure & routing

SPA with history-based client-side routing. Pages (= nav items, in order):

1. **Home** (`/`) — hero: kicker, name, titles/affiliations, splash mission text, "currently:" extra element
2. **Bio** (`/bio`) — large portrait photo (placeholder) + bio text
3. **Research** (`/research`) — publications/preprints list (placeholder entries)
4. **Projects** (`/projects`) — project cards grid (placeholder cards)
5. **CV** (`/cv`) — timeline of education/positions/awards + CV download link (placeholder)
6. **Hobbies** (`/hobbies`) — hobbies grid/cards (placeholder)
7. **Contact** (`/contact`) — email + social links (placeholder)

- Fixed top nav on all pages; active link highlighted in cobalt.
- Real URLs per page (History API + fallback so deep links work on static hosting); browser back/forward trigger the same animated transitions.

## Layout

- **Home:** full-viewport hero. Text block on the left; large light-tinted section icon on the right.
- **All other pages:** persistent **left identity sidebar** + content column on the right. Sidebar contains: face (small portrait placeholder), name, affiliation, splash text. The flipping section icon lives in the content area (upper right).
- **Mobile (narrow screens):** sidebar becomes a compact sticky header (face + name); nav collapses appropriately; icon shrinks or tucks behind content.

## Section icon

A large line-drawn SVG icon, tinted pale cobalt (light, low-contrast — decorative, not competing with text), positioned right of the text content on every page:

| Page | Icon |
|---|---|
| Home | four-point star (echoes the star motif) |
| Bio | smiley |
| Research | atom |
| Projects | cube |
| CV | document |
| Hobbies | game controller |
| Contact | paper plane |

On navigation, the icon does a **3D flip** (rotateY), swapping to the destination page's icon mid-flip. The icon element persists across page transitions (never unmounted), so the flip is continuous. Icons are placeholders and easy to swap.

## Animation choreography

All animation via GSAP timelines. Target: buttery smooth — transform/opacity only (no layout-triggering properties), 60fps.

1. **Home initial load:**
   - Text elements fly in horizontally from alternating sides, staggered: kicker → name → titles → splash → "currently:" element
   - Diamond grid lines fly in behind them (drawn/translated in)
   - Then emphasis lines and star pop in around the name with springy overshoot (back/elastic ease)
   - Big star icon settles in on the right
2. **Home → any other page:**
   - Grid lines fly away
   - Hero content collapses/morphs into the left sidebar (name, face, affiliation, splash) — the same "collapse into sidebar" concept, triggered by navigation instead of scroll
   - Section icon flips to the destination icon
   - Page content slides in
3. **Any page → Home:** full reverse — sidebar expands back into the hero, grid lines fly back in, motifs pop back.
4. **Between non-home pages:** sidebar stays fixed; outgoing content slides out, icon flips, incoming content slides in. Quick (~0.4–0.6s total) so navigation feels snappy.
5. **Reduced motion:** `prefers-reduced-motion: reduce` disables fly-ins/flips; instant (or simple fade) transitions instead.

## Tech stack

- **Build:** Vite, vanilla JS (ES modules), plain CSS
- **Animation:** GSAP (core; Flip plugin for the hero→sidebar collapse if useful)
- **Routing:** small hand-rolled History-API router (~50 lines); no framework
- **Assets:** inline SVG for grid lines, motifs, and section icons; placeholder images for portrait
- **Deploy target:** static hosting (Vercel), with SPA rewrite so deep links resolve to `index.html`

## Architecture

- `index.html` — shell: nav, persistent layout slots (sidebar mount, icon mount, page container)
- `src/router.js` — route table, History API handling, delegates transitions to the animator
- `src/pages/*.js` — one module per page exporting its render (template) + per-page metadata (icon name, title)
- `src/animations/` — `heroIntro.js` (load timeline), `pageTransition.js` (collapse/expand + slide + icon flip), shared eases/durations in `motion.js`
- `src/components/` — nav, sidebar, section icon (flip logic), motifs (grid, star, emphasis lines)
- `styles/` — tokens (colors, type scale, spacing), layout, per-page styles

Each unit is independently understandable: pages know nothing about animation; the animator consumes page metadata; the router only sequences.

## Error handling & edge cases

- Rapid nav clicks mid-transition: kill/fast-forward the running timeline before starting the next (GSAP `timeline.kill()` / progress-to-end) so state never desyncs.
- Unknown route → redirect to Home.
- Direct load on a non-home URL: skip hero intro; render sidebar layout immediately, play only the content entrance.
- Resize across the mobile breakpoint: re-evaluate layout without replaying transitions.

## Testing

- Manual: walk every nav pair (Home↔each page, page↔page), back/forward buttons, deep links, rapid clicking, mobile viewport, reduced-motion.
- Verify no layout-shift jank (transforms only) via DevTools performance trace on the heaviest transition (Home → page).

## Out of scope (for now)

- Real content (all text/images are placeholders)
- Blog, dark mode, CMS, analytics
- Actual deployment (site should be deploy-ready, but deploying is a later step)
