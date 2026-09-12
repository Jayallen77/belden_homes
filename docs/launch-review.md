# Launch review — September 9, 2026

The redesigned site is implemented locally. It has not been deployed to the VPS or the public domain. The following source and delivery items prevent an unconditional launch-ready sign-off.

## Model source decisions needed

| Model | Spreadsheet | Supplied floorplan evidence | Current handling |
| --- | --- | --- | --- |
| Greater Ops | 907 sq. ft., model 14682A | Named-folder drawing says 880 sq. ft., 66 feet, TS1021-P | Spreadsheet specifications retained. Supplied drawing explicitly labeled as a reference needing confirmation. |
| Shifty | 1,600 sq. ft., model 28600E | PDF is a front elevation, not a floorplan. Local JPG is named ac28603h and depicts a 60-foot layout. | Actual floorplan JPG used instead of the elevation. Model/layout match needs confirmation. |
| Ramsey | 1,813 sq. ft., model 28683A | Named-folder PDF says approximately 1,600 sq. ft., 60 feet, 3A2803 | Spreadsheet specifications retained. Supplied drawing explicitly labeled as a reference needing confirmation. |
| Hogancamp | 1,387 sq. ft., model 28523B | Named-folder PDF says approximately 1,484 sq. ft., 56 feet | Spreadsheet specifications retained. Supplied drawing explicitly labeled as a reference needing confirmation. |
| Camp | 800 sq. ft., 2 bedrooms, 1 bathroom, offsite | Floorplan present; no photos supplied in the local folder | Floorplan shown and offsite viewing explained. Photos still needed. |

The current owner instruction makes the new spreadsheet and local assets authoritative over online catalog defaults. Conflicting sources have not been silently substituted or numerically reconciled. No unrelated stock home photos were used. All eight model names come from column A. Super Bee and Bungalow are also names in column B, but are retained because they are the explicitly supplied public names.

## Completed

- Eight model routes, original logo, updated company positioning, concise copy, and shared navigation/footer.
- All requested hours and counties. No obsolete terminology in generated pages or metadata.
- 63 locally supplied home photos converted to WebP with separate small gallery/card versions; untouched originals excluded from the public build.
- Local floorplans, full-size viewing links, keyboard-operated photo galleries, exact filters with empty/reset states, and mobile navigation.
- Server-side Gmail inquiry delivery, fixed destination, validation, error/success feedback, duplicate prevention, spam controls, and production configuration checks.
- Original Clarion application embedded without Palmer branding or tracking parameters. It remains Cavco-hosted; see the integration notes.
- New sitemap, canonical URLs, page-specific metadata, structured business data, readable 404 page, and redirects from the six previous model URLs.
- Removed obsolete catalog data, scraper, model routes, visualizer images/styles, unused legacy assets, and stale internal documentation. Those historical tracked files remain recoverable through Git.

## Verification

- All 17 regular pages checked at 320, 390, 768, 1024, 1280, and 1440 pixels: 102 page/viewport checks with no horizontal overflow, broken loaded local images, missing pages, or duplicate H1s.
- Mobile navigation, Escape behavior, filters, no-match feedback, reset, gallery navigation, model inquiry prefill, required fields, retained entries on error, and simulated success feedback verified.
- Eighteen HTML pages including 404 and 568 internal links/assets/anchors passed the static reference check.
- Five server-side mail test groups passed. They cover validation, fixed recipient, duplicate prevention, missing configuration, delivery failures, cross-origin rejection, and rate limiting. No real email was sent.
- No first-party browser JavaScript errors. The form-failure test intentionally produced a 503 while SMTP was unconfigured.
- Original visualizer loaded with its image assets and no page errors. Desktop and mobile siding selections worked, and a blue-siding image change was verified. Its PDF action rejected the default configuration with missing shake/vertical-siding validation messages. PDF export remains unverified; external application behavior remains dependent on Cavco.

## Email and hosting

Configure the Google Workspace IP-authenticated SMTP relay on the VPS, verify its TLS handshake, then complete an authorized real inquiry and confirm inbox receipt. The FROM and fixed destination are `inquiries@beldenhomesinc.com`; a mailto label alone is not used for form delivery. See the VPS deployment guide for the service, proxy, and relay setup.

## Follow-up visual polish

- Added a warmer navy, brass, and paper palette, stronger page headers, framed floorplan previews, and consistent section details.
- The homepage now uses a real furnished Belden interior in the hero, with beige and sage surfaces, a family-business story, and a prominent Harpursville visit invitation. The former featured-model panel is removed. Homepage social metadata uses the same interior photo.
- Homepage cards, catalog cards, and model-page lead images use local floorplans. Eight optimized preview images total approximately 700 KB. Full-size drawings remain available; source discrepancy notes remain visible.
- Actual home photos remain in the galleries, including the Office model's sole photo.
- The original visualizer now loads automatically on Design options without a launch button, including when the host-page JavaScript is disabled. The live application's preview was inspected at desktop and mobile sizes; its existing export limitation remains as documented above.
- Repeated all 102 responsive checks with zero overflow, broken local images, or first-party JavaScript errors. Rechecked floorplan listings, mobile navigation, filtering, and the Office photo gallery.
- The subsequent homepage redesign passed checks at 11 widths from 320 to 1440 pixels, with all three model cards visible, no broken images, and no JavaScript errors. Mobile navigation and both primary CTAs worked. A shared navigation wrapping fix also eliminated overflow at 200% text size on a 1280-pixel viewport.
