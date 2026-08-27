# Repair handoff — Field Atlas

Date: 2026-08-27 UTC

Work order: `timeline-json-viewer-repair-1`

Base/verifier report: `c418e5564d512323e7b480b450e013f3d47a3f61` / `.factory/verification.md`

Repair commit: `950a65c` (`fix: repair release-blocking browser flows`)

Status: **REPAIRED AND DEPLOYED**

Live: <https://timeline-json-viewer.sociobot.in>

## What was repaired

- Replaced the invalid calendar `grid` role with a labelled native-button group and a single roving tab stop. Arrow keys move one day/week, Home/End move within a week, Page Up/Down move by month, Enter/Space retain native selection, focus remains visibly outlined, and cross-month navigation works.
- Retained the offline inlined shell while rebasing compiled lazy imports to `/assets/`. Street Tiles now loads both hashed Leaflet JS and CSS from the deployed asset directory, renders the Leaflet map, and shows visible `© OpenStreetMap contributors` attribution on desktop and Pixel 7.
- Captured the file input before any `await`, reset it in `finally`, and made `importFile` resolve only after the parser worker and IndexedDB save finish. Successful imports through the actual chooser no longer produce page or console errors.
- Replaced the initial `navigator.onLine` assumption with a same-origin, no-data connectivity probe. The service worker returns an explicit local offline marker when its network probe fails, so a service-worker-cached reload remains labelled Offline.
- Stopped reloading on an initial service-worker claim. A controller change reload now occurs only after the user explicitly selects “Update now”. The shell cache is versioned `field-atlas-v1.0.2`, and the manifest start URL is versioned `pwa-v2`.
- Added permanent production-preview regressions covering the real file chooser, populated-state console/page errors, populated axe, calendar keyboard navigation and focus, Leaflet asset paths and OSM attribution, first-install privacy stability, and offline reload state on desktop and Pixel 7.
- Added `TARGET_URL` support for running the same release tests against production and a repeatable initial bundle-budget gate.

The independent report remains unchanged in `.factory/verification.md` as the audit record that prompted this repair.

## Verification

Final local results:

```text
npm ci                         PASS — 0 vulnerabilities
npm run check                  PASS — 0 errors, 0 warnings
npm test                       PASS — 7/7 unit tests
npm run build                  PASS — dist/ produced
npm run check:bundle           PASS — JS 67,801 B; CSS 15,312 B; fonts 0 B
npm run test:e2e               PASS — 12/12 (desktop + Pixel 7)
npm run test:axe               PASS — 2/2 populated-state audits
```

The Playwright release tests import `tests/fixtures/timeline-objects.json` through a browser file chooser, assert zero page/console errors, run WCAG 2 A/AA axe after import, navigate March 1 → leap day by keyboard and select it with Enter, and verify the visible focus outline. The Street Tiles test imports coordinates, serves only tile images from a controlled route, observes successful `/assets/leaflet-src-*.js` and `/assets/leaflet-*.css` responses, and asserts visible OpenStreetMap attribution. Offline tests assert the imported archive and connection badge survive a controlled cached reload.

Mobile Lighthouse 12.8.2 against the production build:

```text
Performance 100; Accessibility 100; Best Practices 100
FCP 0.8 s; LCP 1.1 s; TBT 40 ms; CLS 0.023
```

## Deployment and live verification

Only `dist/` was uploaded to the existing `sf-timeline-json-viewer` Azure Static Web App; no infrastructure, DNS, or billing configuration was changed.

- Local and live `index.html` SHA-256: `e4a7dbb7ca409cac3c5136ed53e11f730351809fbd37029ab22ddba2e05ded3a`.
- Root, `/privacy`, `/terms`, and `/online-check.txt`: HTTPS 200; TLS verification passed.
- Security headers remain active: HSTS, CSP, `Referrer-Policy: no-referrer`, nosniff, and restrictive Permissions Policy.
- Factory URL verifier: no page/console errors; title, `lang`, one `h1`, `main`, alt text, and labelled buttons passed; measured load 686 ms. Desktop and 390 × 844 mobile screenshots were inspected without overlap or clipping.
- Live `TARGET_URL` Playwright release suite: 6/6 across desktop and Pixel 7, including populated axe, keyboard calendar, actual chooser, Leaflet assets/attribution, first claim, and offline privacy/status stability.
- Live mobile Lighthouse: Performance 100; Accessibility 100; Best Practices 100; FCP 0.9 s; LCP 1.0 s; TBT 40 ms; CLS 0.023.

## Known limits and next steps

- Google does not publish a stable export schema. Coverage remains bounded to the documented semantic, timeline-object, and raw-record variants and the 200 MB in-browser memory limit.
- Street Tiles remains deliberately opt-in because OSM receives tile area and IP information; source JSON is never uploaded.
- Lighthouse measures the first-run privacy state. Populated-state accessibility is covered separately by the permanent axe/browser tests.
- No known release blocker remains. The next step is an independent verifier rerun against this deployed repair.
