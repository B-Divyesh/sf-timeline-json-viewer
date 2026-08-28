# Field Atlas polish 1 handoff

Work order: `timeline-json-viewer-polish-1`

Base: `592e17a325c51af80699a3da0f5ee28b43da2b56`
Review repaired: `5b1722a3507fa57902bbb3ff8e5e7ff679f38cc6`

## Delivered

- Replaced the first-visit privacy gate with a plain-language first screen and adjacent sample/real-file actions.
- Added direct `/demo` and `?demo=1` sample entry, a persistent reset/exit banner, and separate `demo:field-atlas-v1` IndexedDB storage.
- Added KML date-range export.
- Added claim registry, 12 tagged Playwright claim tests, demo documentation, copy audit, metadata, favicon/social assets, crawl files, static 404, legal links, and focus-managed history routing.
- Kept the archival field-atlas visual system. The new social image and Apple touch icon are locally composed original derivatives recorded in `design.md`.
- Corrected the inline-shell Vite replacement bug that could inject HTML into JavaScript containing replacement tokens. The initial-load budget is again measured from actual HTML attributes, not lazy import strings.

## Local verification

Run after `npm ci`:

```sh
npm run check
npm test
npm run build
npm run check:bundle
npm run test:e2e
npm run test:axe
npm run test:claims
```

Observed in this work order:

| Gate | Result |
|---|---|
| `npm run check` | PASS — 0 errors, 0 warnings |
| `npm test` | PASS — 7 tests |
| `npm run build` | PASS — `dist/` created |
| `npm run check:bundle` | PASS — JS 73,579 B; CSS 17,130 B; fonts 0 B |
| `npm run test:axe` | PASS — 2/2 desktop + mobile populated demo audits |
| `npx playwright test --workers=2` | PASS — 34/34 desktop + mobile scenarios |
| `npm run test:claims` | PASS — all 12 tagged claims on desktop and mobile |

The claim tests enter only `/?demo=1`. They cover demo storage isolation, offline reload, all three input families, browse/search output, CSV/GPX/KML bytes, request logs, tile opt-in, persistence, and the 201 MB rejection.

## Deployment and live verification

Commit `bad2fe9` was pushed to `main` and `dist/` was deployed directly to Azure Static Web Apps `sf-timeline-json-viewer` production with the work-order identity. Cold HTTP checks passed on both the Azure hostname and the custom domain:

- `https://timeline-json-viewer.sociobot.in/` returns title `Field Atlas — Browse Google Timeline JSON`.
- `https://timeline-json-viewer.sociobot.in/?demo=1` returns the current shell; the permanent Playwright sample workflow verifies its seeded entries and banner locally.
- `https://timeline-json-viewer.sociobot.in/not-a-real-page` returns HTTP **404** and the designed static 404 page.
- `robots.txt` is plain text and `sitemap.xml` is XML, not SPA fallbacks.

To repeat the browser verification against production:

```sh
TARGET_URL=https://timeline-json-viewer.sociobot.in npx playwright test --workers=1
curl -I https://timeline-json-viewer.sociobot.in/not-a-real-page
```

Expected: the cold root names the job and has the sample action; `/?demo=1` has a demo banner and sample entries; `/not-a-real-page` is the static 404 with HTTP 404; and `/robots.txt` and `/sitemap.xml` are real files.

## Known limits

Google can change its export schemas. Field Atlas supports the three tested input families and rejects inputs over 200 MB. OpenStreetMap tiles are deliberate opt-in requests; the private coordinate map is the default.
