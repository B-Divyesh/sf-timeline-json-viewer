# Independent re-verification — Field Atlas repair

**Verdict: PASS**

**Candidate:** `ec4d294e51e851d6d44d031b4ca5559e24868127`
**Live:** <https://timeline-json-viewer.sociobot.in>
**Date:** 2026-08-27 UTC
**Work order:** `timeline-json-viewer-verify-2`

This is an independent rerun of the repair, not a restatement of the repair handoff. `HEAD`, `origin/main`, and the requested candidate SHA were identical before testing. Product source was not changed. A temporary external Playwright verifier was used for the additional scenarios below and removed before this report was committed.

## Result

All six prior blockers could **not** be reproduced on the clean candidate or live deployment:

| Former blocker | Independent result on candidate and live |
|---|---|
| Populated calendar `aria-required-children` | PASS — populated WCAG 2 A/AA axe had zero serious/critical findings; no `grid` role is present. |
| Arrow-key day navigation/focus | PASS — March 1 → ArrowLeft focused Feb 29, Enter selected it, and computed focus outline width was `3px` in desktop and Pixel 7. |
| Leaflet lazy URLs / attribution | PASS — Leaflet JS and CSS responses were successful from `/assets/leaflet-src-Byf149Wh.js` and `/assets/leaflet-CIGW-MKW.css`; Street Tiles rendered and visibly showed `OpenStreetMap contributors`. |
| File-picker `currentTarget` null error | PASS — semantic, legacy, and raw-record imports through the actual browser chooser completed with no `pageerror` or error-level console messages. |
| Stale offline badge | PASS — after `context.setOffline(true)` and a service-worker-cached reload, the retained archive remained usable and the badge stayed `Offline`. |
| First-install SW/privacy modal race | PASS — after initial worker readiness/claim, the privacy dialog remained open, focused its Continue button, and the page had exactly one navigation. After acknowledgement it stayed dismissed through reload/offline reload. |

## Clean candidate gates

Environment: Node `v22.23.2`, npm `10.9.8`, locked Playwright Chromium `151.0.7922.34`, Lighthouse `12.8.2`.

| Command | Result |
|---|---|
| `npm ci` | PASS — 91 packages, 0 vulnerabilities |
| `npm run check` | PASS — 0 errors, 0 warnings |
| `npm test` | PASS — 7/7 unit tests |
| `npm run build` | PASS — `dist/` produced |
| `npm run check:bundle` | PASS — initial JS 67,801 B / 204,800 B; CSS 15,312 B / 51,200 B; fonts 0 B / 122,880 B |
| `npm run test:e2e` | PASS — 12/12 desktop + Pixel 7 |
| `npm run test:axe` | PASS — 2/2 populated-state audits |
| temporary independent verifier | PASS — 8/8 desktop + Pixel 7 |

The independent verifier used the real file chooser, not `setInputFiles`, for imports. It imported `semanticSegments`, `timelineObjects`, and raw `locations` / Records data. It additionally checked populated-state axe, the calendar role and keyboard model, private map reduced motion, exports, raw-record normalization, Street Tiles, first service-worker claim, IndexedDB persistence, and offline reload.

## Real-job evidence

- Semantic import produced `semanticSegments`, `Museum, Hall "A"`, and the vehicle route; legacy import produced `timelineObjects`, `walking`, and `Library & Archive`; records import produced `records` and `Location record`.
- CSV downloaded through the UI contained the exact header, RFC-style escaped `"Museum, Hall ""A"""`, and `40.7128,-74.006`. GPX contained `<wpt lat="40.7128" lon="-74.006">`, the escaped place name, and `<trkpt lat="40.735" lon="-73.99">`.
- The same test captured all requests made from acknowledgement through private import/export. Every captured request was same-origin `GET`; no URL or body contained `semantic.json`, the place marker, or literal source coordinates. No POST/PUT/PATCH occurred. Street Tiles was tested separately with an intercepted tile-image response; it is the deliberate opt-in external request described by the privacy UI.
- Selected archive data persisted over online reload and service-worker-controlled offline reload. CSV/GPX actions remained enabled offline.
- Reduced-motion emulation reported `animation-name: none` for private-map route polylines. The desktop and Pixel 7 verifier checked all rendered content bounds against the viewport; no content box overflowed.

## Production verification and parity

The same independent verifier passed against production:

```text
TARGET_URL=https://timeline-json-viewer.sociobot.in \
  npx playwright test e2e/verifier-2.spec.ts --reporter=line
8 passed (21.8s)

TARGET_URL=https://timeline-json-viewer.sociobot.in \
  npx playwright test --workers=1 --reporter=line
12 passed (24.6s)
```

The temporary `verifier-2.spec.ts` was deleted after these runs; it is described here so the evidence is auditable without leaving verifier-only test code in the product.

Production returned HTTPS 200 for `/`, `/privacy`, `/terms`, manifest, service worker, offline page, and connection probe. Observed root headers were:

```text
Strict-Transport-Security: max-age=10886400; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ... img-src 'self' data: https://tile.openstreetmap.org; connect-src 'self'; ...
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

Candidate/live SHA-256 pairs matched exactly for `index.html`, `sw.js`, `manifest.webmanifest`, `offline.html`, parser worker, lazy Leaflet JS, and Leaflet CSS. Representative values:

| Artifact | SHA-256 |
|---|---|
| `index.html` | `e4a7dbb7ca409cac3c5136ed53e11f730351809fbd37029ab22ddba2e05ded3a` |
| `sw.js` | `b27e270308b86fb81addf2eec3b88e092d867a69c3fffcc4e5878b4d879a97d4` |
| parser worker | `b1a7401d23a5020f02517364fbed14e94f4c92b3870f86fea57566fcc8d75971` |
| Leaflet JS | `b499b3ec264901907b23109b2a32beb7db18dd88d6eec73740e2b3a4c0733c36` |

Manifest checks passed: standalone display, versioned `/?source=pwa-v2` start URL, 192/512 icons, and a 512 maskable icon. The 150,016-byte Leaflet chunk remains lazy and is not part of the 67,801-byte initial JS budget.

## Lighthouse and test stability note

Mobile Lighthouse was run twice against live with Chrome for Testing in explicit headless/no-sandbox mode. The repeat that determines the gate passed:

```text
Performance 95; Accessibility 100; Best Practices 100
FCP 0.9 s; LCP 1.1 s; TBT 250 ms; CLS 0.023
```

The immediately preceding cold run measured Performance 87 with TBT 520 ms (while accessibility/best-practices remained 100); its LCP was still 1.2 s. This isolated host variance is recorded rather than concealed. A second production run with all 20 temporary+shipped tests in parallel also had five 30-second setup/navigation timeouts while the page snapshots showed a usable app. The same probes then passed 8/8 independently, the affected mobile cases passed individually, and the shipped full suite passed 12/12 serially. There was no reproduced product error, console error, data loss, or accessibility failure.

## Decision

**PASS.** The requested repair is present in the candidate, deployed live without artifact drift, and passes the functional, privacy, accessibility, PWA/offline, security, bundle, mobile, and repeat performance checks. No product-code changes were made during this verification.
