# Project Log

## 2026-06-29 — First pass rebuild
- Scraped legacy WordPress pages into `docs/old-site-content-reference.md`.
- Created modern static site with simplified sitemap.
- Added current inventory and Belden-branded model pages.
- Added turnkey setup, buying process, visualizers, FAQ/resources, about, and contact pages.
- Downloaded Cavco source images locally for model pages.

## 2026-06-29 — Visual polish pass
- Created transparent cropped PNG logo and switched all pages to use it.
- Enlarged header logo and hero-card logo while preserving clean nav.
- Tightened homepage headline and simplified repeated factory-built-home phrasing.
- Removed visualizer card logo watermark backgrounds.
- Refined buying-process cards into a balanced 3-over-2 desktop layout with smaller badges and shorter copy.
- Re-checked homepage, visualizer page, and buying-process page visually; browser console clean.

## 2026-06-29 — Visualizer card photo update
- Updated the two design visualizer linkout cards to use photo previews beside the copy and Launch Visualizer buttons.
- Kept only Interior and Exterior visualizers; Community visualizer remains excluded.
- Added supplied interior/exterior preview assets to `assets/img/`.

## 2026-06-29 — Visualizer card layout fix
- Removed visualizer card pseudo-element overlays/watermark behavior.
- Changed visualizer cards to a two-card desktop grid with text above and smaller fixed-height image previews below.
- Reduced visualizer title size and balanced spacing/image height for desktop and mobile.

## 2026-06-29 — Visualizer button alignment fix
- Used a grid-based top content group inside each visualizer card so eyebrow, title, description, and Launch Visualizer button align across both cards.
- Kept preview images fixed-height at the bottom so image starts align horizontally.
- Confirmed no card background image/watermark CSS remains.

## 2026-06-29 — Visualizer equal-height card fix
- Made desktop/tablet visualizer grid stretch both cards to equal height.
- Set visualizer cards to height: 100% and flex columns.
- Anchored fixed-aspect preview media areas to the bottom with margin-top:auto so bottoms align cleanly.
