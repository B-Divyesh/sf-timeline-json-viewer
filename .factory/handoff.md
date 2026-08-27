# Field Atlas v1 handoff

Date: 2026-08-27
Work order: `timeline-json-viewer-build-1`

## Shipped

- Svelte 5 + TypeScript + Vite static PWA with an original archival field-atlas interface documented in `.factory/design.md`.
- Local imports for post-2025 `semanticSegments`, legacy `timelineObjects`, and raw `locations` / Records JSON. The source file is streamed from the File API and decoded/parsed in a dedicated Web Worker with real read progress and actionable errors.
- Normalized visits, trips, waypoints, E7 coordinates, distances, source-offset day boundaries, and wall-clock times. Unsupported/empty items are counted and surfaced rather than silently claimed as supported.
- Month calendar, prior/next populated-day navigation, selected-day ledger, named-place/activity search, local SVG route plot, coordinates, durations, distances, and a text itinerary equivalent to map content.
- Optional lazy-loaded Leaflet + OpenStreetMap layer. It is off by default, disabled offline, and has OSM attribution and an explicit privacy explanation.
- Obvious selected-range CSV and GPX exports with escaping and meaningful filenames.
- IndexedDB persistence, selected-day persistence, install manifest, original 192/512/maskable icons, versioned service-worker shell, offline fallback, and an in-app service-worker update prompt.
- First-run modal, `/privacy`, `/terms`, useful empty/loading/error/offline states, drag/drop plus keyboard file control, responsive mobile layout, focus states, 44 px controls, reduced-motion behavior, and skip/landmark semantics.
- Synthetic fixtures only; no personal location data, backend, analytics, tracking, CDN script/font, account, or sync.

## Verification

All commands passed from a clean production build on 2026-08-27:

- `npm run check`: 0 errors, 0 warnings.
- `npm test`: 7/7 Vitest tests passed. Coverage fixtures exercise all three accepted structures, malformed/unsupported input, offset date boundaries, E7 normalization, and CSV/GPX escaping.
- `npm run build`: passed and produced `dist/`.
- `npm run test:e2e`: 6/6 Playwright tests passed across desktop Chromium and Pixel 7 profiles. This includes import/search/export controls, IndexedDB refresh restoration, service-worker-controlled offline reload, no load console errors, and axe WCAG A/AA checks with 0 serious/critical findings.
- Lighthouse 12.8.2 mobile-class run against the production preview: Performance **99**, Accessibility **100**, Best Practices **100**; FCP 0.8 s, LCP 1.1 s, CLS 0.045, TBT 110 ms. Lighthouse 12 no longer publishes the former PWA category; install/offline behavior is covered by Playwright.
- Visual inspection completed at 1440 px desktop and Pixel 7 width. One discovered offset-time display issue and a cross-month calendar selection issue were corrected before the final gates.

Production artifact measurements:

- Offline-safe initial HTML shell: 81,926 bytes uncompressed, containing 65,997 bytes JS and 15,312 bytes CSS (well under the 200 KB initial-JS and 50 KB CSS budgets).
- Import worker: 5,150 bytes, loaded only on import.
- Leaflet: 150,016 bytes JS + 15,607 bytes CSS, loaded only when the user enables street tiles.
- No font payload and no initial hero image.

## Run and deploy

```sh
npm install
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Deploy the contents of `dist/` to Azure Static Web Apps. `staticwebapp.config.json` is included in the output for navigation fallback and security headers. The Param Factory owns infrastructure/DNS; this repository intentionally does not mutate them.

Release commits `772ac63` and `5f990a1` were pushed to `origin/main`. A post-push request to `https://timeline-json-viewer.sociobot.in` returned `Could not resolve host` from the worker, so live desktop/mobile verification is pending the factory-owned Azure/DNS deployment. The identical production `dist/` was verified locally on desktop and mobile as detailed above.

## Honest limits / next work

- Google has no stable public schema. Only the structures and fields represented by the synthetic fixtures are claimed. New wrappers or renamed fields need new anonymized/synthetic regression fixtures.
- File reads are streamed and all JSON work is off the UI thread, but the completed text and parsed object must still fit browser memory. Files over 200 MB are rejected. A deeply nested or unusually dense file near the limit can exceed a mobile browser’s memory or IndexedDB quota; the UI reports storage failure and the original remains untouched.
- Imported normalized events are currently persisted as one IndexedDB value. Chunked event stores would improve quota behavior and incremental rendering for multi-million-point exports.
- GPX and CSV are core; KML is intentionally not included in v1.
- Street tiles are not cached for offline use. The private coordinate plot, ledger, search, and exports work offline. Enabling OSM tiles reveals IP address and requested tile areas to OSM, as disclosed in-product.
- The 60% real-world schema-coverage target needs post-release opt-in reports; this privacy-preserving app deliberately has no telemetry. Coverage cannot be inferred automatically.
