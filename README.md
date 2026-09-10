# Belden Homes Inc.

Static HTML website with a Node.js inquiry handler for the owner's VPS. The public catalog contains eight Belden models. Original model photos and plans are preserved separately from the optimized website assets.

## Work locally

Requires Node.js 22+ and pnpm.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm start
```

Open http://localhost:3000. Without SMTP configuration, form submissions return a clear unavailable message; they do not simulate successful delivery.

## Edit content

- `data/business.json`: contact information, hours, and counties.
- `data/belden-models.json`: public model names and specifications.
- `data/sources/OFFERED MODELS.xlsx`: owner-supplied source, including internal reference columns; never published.
- `data/model-assets.json`: explicit photo/floorplan mapping and unresolved source notes.
- `assets/MODEL PHOTOS`: untouched originals.
- `scripts/prepare-model-assets.py`: optional asset regeneration using Python, openpyxl, Pillow, macOS sips, and Poppler. The production build does not require these tools.
- `scripts/render-site.mjs`: shared page structure and copy. Run the build after editing; generated HTML should not be edited directly.
- `scripts/homepage.mjs` and `assets/css/homepage.css`: homepage composition and styling, using the same model and business sources as the rest of the site.
- `assets/css/styles.css` and `assets/js/`: shared design and interactions.
- `server/`: Gmail SMTP delivery, validation, and public-file serving.

Only `dist/client` is public. Source spreadsheets, raw HEIC photos, server credentials, historical records, and internal model references are excluded from the website build.

See [launch review](docs/launch-review.md), [VPS deployment](docs/vps-launch.md), and [visualizer integration](docs/visualizer-integration.md). The redesign is implemented locally; unresolved source conflicts and live email verification must be completed before launch.
