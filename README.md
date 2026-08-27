# Field Atlas — local Timeline JSON viewer

Field Atlas turns Google Maps Timeline exports back into browsable days, visits, trips, and paths. It is for people with legacy Google Location History Takeout files or post-2025 on-device exports who want a maintained viewer without uploading an intensely private file.

Live site: <https://timeline-json-viewer.sociobot.in>

## What it does

- Opens `Timeline.json`, legacy `timelineObjects` Takeout JSON, and raw `Records.json`/`locations` exports up to 200 MB.
- Detects `semanticSegments`, `timelineObjects`, and raw record structures in a dedicated Web Worker so the interface remains responsive.
- Provides a month calendar, day ledger, place/activity search, private coordinate plot, and a complete text alternative for the map.
- Optionally lazy-loads OpenStreetMap street tiles with attribution. Tiles are off by default.
- Exports a chosen date range as CSV or GPX.
- Saves the normalized archive in IndexedDB and installs as a PWA, so browsing, search, the ledger, private map, and exports survive refresh and work offline.

No source content, extracted coordinates, searches, or exports are sent to a server. There is no account, analytics, tracking, sync, backend, CDN script, or remote font. See the in-app `/privacy` page for the exact optional tile behavior.

## Supported data and limits

Google does not publish a stable export schema. Field Atlas supports the fields covered by the synthetic fixtures in `tests/fixtures`: semantic visits/activities/timeline paths, legacy place visits/activity segments/waypoints, and E7 raw records. Unrecognized empty items are skipped with a warning; it does not claim complete coverage of every Google variation.

The file is read and `JSON.parse`d in a worker, keeping that cost off the main thread, but the parsed object must still fit browser memory. Files over 200 MB are rejected. Keep the original JSON as your authoritative backup. Source offset dates and wall-clock times are preserved for day grouping; epoch-only records use their ISO/UTC representation.

## Run and verify

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
npm run check
npm test
npm run build
npm run check:bundle
npx playwright install chromium   # first time only
npm run test:e2e
npm run test:axe
```

`npm run build` creates the deployable static site in `dist/`. The browser suite covers desktop and Pixel-sized mobile, import through the real file chooser, calendar keyboard navigation, production Leaflet asset loading and attribution, persistence, first-install privacy stability, a service-worker-controlled offline reload, console errors, and populated-state serious/critical axe violations. `npm run check:bundle` enforces the initial-load JavaScript, CSS, and font budgets.

## Deploy

Deploy the contents of `dist/` to Azure Static Web Apps. `public/staticwebapp.config.json` is copied into the build and supplies SPA routes, security headers, and manifest MIME types. Deployment infrastructure, DNS, and billing intentionally live outside this repository.

## Project notes

- `.factory/brief.json` records the researched product opportunity.
- `.factory/design.md` records the product-specific archival field-atlas visual system and asset provenance.
- `.factory/handoff.md` records release verification and known limits.

Licensed under the MIT License.
