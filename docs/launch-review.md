# Launch and model review

The model corrections were prepared and reviewed locally on October 1, 2026. The owner approved committing and pushing them to the existing GitHub `origin/main` repository. VPS deployment remains a separate step. Earlier launch and design checks are retained below, along with the existing source and delivery notes.

## October 1 model corrections

- Ramsey is model 28600E, 1,600 sq. ft.; Shifty is model 28683A, 1,813 sq. ft. Each home retains its specifications, photos, floorplan notes, and onsite availability. Only spreadsheet A3/A5 changed; all other workbook package entries and cell formatting were preserved.
- Source and optimized folders now follow the corrected names. Both named model routes remain valid. The numbered legacy redirects follow the same physical homes, and the physical homepage card order is unchanged.
- Camp has four exterior photos, led by IMG_5324, then IMG_5321, IMG_5323, and IMG_5325. The gallery explains offsite viewing and uses the existing enlargement and keyboard controls. Cards remain floorplan-led.
- Shifty now uses its supplied straightened `FP_1.pdf`; Hogancamp uses `FP_2.pdf`. Full-size WebPs preserve the PDF raster pixels without further alterations. Previews and dimensions were regenerated, and floorplan URLs use content-based cache versions.
- All 126 pre-existing photo derivatives and all 76 supplied source files are byte-for-byte unchanged after accounting for folder renames. The four full/preview floorplan derivatives are the only existing optimized images whose content changed.

## October 1 verification

- A second asset regeneration retained the corrected catalog and all 150 WebPs byte-for-byte. Exactly eight models remain: seven onsite and Camp offsite, with 67 gallery photos in total.
- All 17 regular pages passed at 1440, 1024, 768, 390, and 320 pixels: 85 page/viewport checks with no overflow, broken local images, duplicate H1s, or first-party JavaScript/console errors. The replacement floorplans and Camp gallery were visually reviewed at desktop, tablet, and mobile sizes.
- Corrected name/model-number pairs, homepage order, metadata, inquiry preselection, full-size floorplan links, filtering/reset/empty states, mobile navigation, Camp gallery enlargement/arrow keys/close/focus restoration, both changed legacy redirects, and the eight sitemap model routes passed browser checks.
- Static validation passed 18 HTML pages and 576 internal references, including content-based floorplan versions. All ten inquiry-handler and SMTP-configuration regression tests passed after integrating the existing Workspace relay fixes, with simulated mail delivery; no real inquiry was sent. External applications were excluded from this model-correction browser pass.
- Local review server: `http://localhost:3000`. Local review is complete and the owner approved GitHub `main` publication; no VPS deployment was performed in this pass.

## Retained floorplan source notes

| Model | Spreadsheet | Supplied floorplan evidence | Current handling |
| --- | --- | --- | --- |
| Greater Ops | 907 sq. ft., model 14682A | Named-folder drawing says 880 sq. ft., 66 feet, TS1021-P | Spreadsheet specifications retained. Supplied drawing explicitly labeled as a reference needing confirmation. |
| Ramsey | 1,600 sq. ft., model 28600E | PDF is a front elevation, not a floorplan. Local JPG is named ac28603h and depicts a 60-foot layout. | Actual floorplan JPG used instead of the elevation. Existing model/layout reference note retained. |
| Shifty | 1,813 sq. ft., model 28683A | Straightened FP_1.pdf still lists approximately 1,600 sq. ft., 60 feet, 3A2803 | Spreadsheet specifications retained. Existing reference note retained as requested. |
| Hogancamp | 1,387 sq. ft., model 28523B | Straightened FP_2.pdf still lists approximately 1,484 sq. ft., 56 feet | Spreadsheet specifications retained. Existing reference note retained as requested. |
| Camp | 800 sq. ft., 2 bedrooms, 1 bathroom, offsite | Floorplan and four supplied exterior photos | Floorplan shown with an exterior gallery; offsite viewing explained. |

The current owner instruction makes the new spreadsheet and local assets authoritative over online catalog defaults. Conflicting sources have not been silently substituted or numerically reconciled. No unrelated stock home photos were used. All eight model names come from column A. Super Bee and Bungalow are also names in column B, but are retained because they are the explicitly supplied public names.

## Completed

- Eight model routes, original logo, updated company positioning, concise copy, and shared navigation/footer.
- All requested hours and counties. No obsolete terminology in generated pages or metadata.
- 67 locally supplied home photos in WebP with separate small gallery versions; untouched originals excluded from the public build.
- Local floorplans, full-size viewing links, keyboard-operated photo galleries, exact filters with empty/reset states, and mobile navigation.
- Server-side Gmail inquiry delivery, fixed destination, validation, error/success feedback, duplicate prevention, spam controls, and production configuration checks.
- Original Clarion application embedded without Palmer branding or tracking parameters. It remains Cavco-hosted; see the integration notes.
- New sitemap, canonical URLs, page-specific metadata, structured business data, readable 404 page, and redirects from the six previous model URLs.
- Removed obsolete catalog data, scraper, model routes, visualizer images/styles, unused legacy assets, and stale internal documentation. Those historical tracked files remain recoverable through Git.

## Verification

- All 17 regular pages checked at 320, 390, 768, 1024, 1280, and 1440 pixels: 102 page/viewport checks with no horizontal overflow, broken loaded local images, missing pages, or duplicate H1s.
- Mobile navigation, Escape behavior, filters, no-match feedback, reset, gallery navigation, model inquiry prefill, required fields, retained entries on error, and simulated success feedback verified.
- Eighteen HTML pages including 404 and 576 internal links/assets/anchors passed the current static reference check, including corrected model identities, four Camp photos, and floorplan cache versions.
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
