# Independent verification — Field Atlas

**Verdict: FAIL**

**Candidate:** `d9baa843b88af1432fed9b30eb2f0695b50a5d28`

**Live:** <https://timeline-json-viewer.sociobot.in>

**Date:** 2026-08-27 UTC

**Work order:** `timeline-json-viewer-verify-1`

The release is rejected because a populated archive produces a critical axe finding. Two further shipped regressions were reproduced in both the clean candidate and live deployment: the Street Tiles feature cannot load its Leaflet chunk, and every successful file-picker import raises an uncaught page error. Core private import, browse, search, export, persistence, and offline behavior otherwise worked.

## Verification basis

The repository started clean on `main`, `origin/main` resolved to the requested commit, and the candidate was tested from a detached clean worktree:

```text
git worktree add --detach /tmp/timeline-verify.d4q2f4 d9baa843b88af1432fed9b30eb2f0695b50a5d28
HEAD is now at d9baa84 docs: record production deployment status
git status --short --branch
## HEAD (no branch)
```

Environment: Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2` as locked, Chrome for Testing `151.0.7922.34`, Lighthouse `12.8.2`. No product source was changed. The expanded verifier and two-version service-worker server were temporary files in the detached worktree only.

## Commands and results

| Command | Result |
|---|---|
| `npm ci` | PASS — 91 packages installed; 0 vulnerabilities |
| `npm run check` | PASS — 0 errors, 0 warnings |
| `npm test` | PASS — 2 files, 7/7 tests |
| `npm run build` | PASS — `dist/` produced |
| `npm run test:e2e` | Initial infrastructure failure because the clean image lacked Chromium; after `npx playwright install chromium`, PASS — 6/6 across desktop and Pixel 7 |
| `npx playwright test e2e/verifier.spec.ts` | Expanded local scenarios exercised in both projects. A stable 14/14 run recorded the known defects as expected observations; separate visual and calendar-arrow cases passed 2/2 each. A later combined run was 16 passed, 2 skipped, 2 harness failures caused by the app's first-load service-worker/privacy-dialog reload race. The individual cases were rerun in isolation. |
| `TARGET_URL=https://timeline-json-viewer.sociobot.in npx playwright test e2e/verifier.spec.ts` | Live core run: 12 passed; 2 assertions differed only because the broken lazy chunk is a live 404 instead of the preview server's HTML fallback. Focused live tile rerun: 2/2, confirming the defect on desktop and mobile. |
| `SW_UPDATE_URL=http://127.0.0.1:4190 npx playwright test e2e/verifier.spec.ts --grep 'service worker installs'` | PASS — 2/2; cache transitioned from `field-atlas-v1.0.1-shell` to `field-atlas-v1.0.2-shell` after the visible update prompt was accepted |
| `CHROME_PATH=... npx lighthouse@12.8.2 https://timeline-json-viewer.sociobot.in ...` | PASS for the empty/modal state — Performance 100, Accessibility 100, Best Practices 100 |

The repository's own axe test passes only because it audits the empty state. The independent audit imported data first and exposed the release-blocking finding below.

## Real-job functional results

Synthetic fixtures contained unique names and coordinates and covered `semanticSegments`, `timelineObjects`, and `locations`/Records.

| Scenario | Candidate | Live | Evidence |
|---|---|---|---|
| Import all three schemas | PASS | PASS | Correct schema labels and 3/2/2 normalized entries appeared in the itinerary |
| Day selection and timezone boundaries | PASS | PASS | `2024-02-29T23:30:00-08:00` remained on Feb 29 at `23:30`; `2024-03-01T00:10:00+14:00` remained on Mar 1; month and next-populated-day controls worked |
| Search | PASS | PASS | Activity search matched `CYCLING`; a miss showed the no-results state; clearing restored the day |
| Text itinerary / map alternative | PASS | PASS | The ordered itinerary exposed names, activity/type, time, duration, distance, and coordinates; the private SVG had a title and description pointing to the itinerary |
| Date-range CSV | PASS | PASS | `field-atlas_2024-03-01_2024-03-01.csv` contained only the Mar 1 cycling event and coordinates, excluding Feb 29 and Mar 2 records |
| Date-range GPX | PASS | PASS | Matching filename and `<trkpt lat="-17.713371" lon="178.065032">`; out-of-range names absent |
| Persistence | PASS | PASS | Selected day and IndexedDB archive survived reload |
| Offline reload with imported data | PASS with note | PASS with note | Service-worker-controlled offline reload restored the selected itinerary and exports; Chromium reported `navigator.onLine: true` and UI `Online` after that reload (defect P2) |
| Malformed JSON | PASS | PASS | Actionable `not valid JSON` alert |
| Unsupported JSON | PASS | PASS | Actionable `No supported timeline data` alert |
| Wrong extension | PASS | PASS | Actionable `.json` guidance |
| Optional Street Tiles | **FAIL** | **FAIL** | Leaflet chunk requested from the wrong root URL; no map, tile requests, or visible OSM attribution |

## Privacy and network evidence

Private-mode import and the complete browse/search/export/reload/offline workflow were captured at the browser-context request layer using the marker `Boundary Secret Alpha` and coordinates `35.123456,-120.654321`:

```json
{"count":20,"methods":["GET"],"origins":["http://127.0.0.1:4173"],"bodies":0}
{"count":20,"methods":["GET"],"origins":["https://timeline-json-viewer.sociobot.in"],"bodies":0}
```

- No request URL or body contained the source filename, marker, or coordinates.
- There were no POST/PUT/PATCH requests and no external requests with street tiles off.
- Exhaustive source search found no `XMLHttpRequest`, `sendBeacon`, `WebSocket`, analytics, sync, or upload endpoint. The source file is read with `File.stream()` inside the local worker and the normalized result is placed in IndexedDB.
- The only runtime `fetch` calls are same-origin service-worker shell/runtime fetches. The only intended external data request is the opt-in `https://tile.openstreetmap.org/{z}/{x}/{y}.png` image layer. The CSP limits `connect-src` to self and permits that one image origin.
- Therefore the source JSON and literal coordinates are not uploaded. If Street Tiles is repaired, the requested OSM tile indices will reveal an approximate viewed area and IP address, as the privacy UI states.
- There are no third-party scripts, fonts, analytics, accounts, or backends. `/privacy` and `/terms` both return 200.

## Accessibility, keyboard, mobile, and motion

- Semantic basics present: `lang="en"`, title, one `h1`, `main`, header/footer/nav landmarks, labeled form fields, skip link, designed focus rings, and private-map text alternative.
- Populated-state axe (`wcag2a`, `wcag2aa`) result on desktop and Pixel 7: **one critical violation**, `aria-required-children`, one node. `.days[role="grid"]` directly contains buttons, which are not allowed grid children.
- The declared calendar grid also does not implement arrow-key navigation. From selected Mar 2, `ArrowLeft` left both focus and selection on Mar 2. All controls remain reachable by Tab and operable by Enter/Space, but tabbing through every day is inefficient.
- Keyboard-only file chooser activation, search, date controls, exports, Street Tiles control, legal links, and dialog behavior were exercised. The initial privacy button received focus.
- Reduced-motion emulation produced `animation-name: none` for route polylines.
- Pixel 7 (`412 × 915`) inspection showed the ledger, private map, exports, and footer in a usable single-column order with no content overlap.
- A 200% root-text resize retained visible content and export controls. Measured document width was `424` versus `412` CSS px, caused by painted focus/shadow overflow; no element bounding box exceeded the viewport and no content was lost.
- Desktop `1280 × 720` and Pixel 7 full-page screenshots were visually inspected. No additional blocking layout defect was observed.

## PWA and offline behavior

- Manifest: standalone display, versioned start URL, matching theme/background colors, 192/512 icons, and a 512 maskable icon.
- Install: a controller was obtained and `field-atlas-v1.0.1-shell` contained `/index.html`.
- Offline: an already imported IndexedDB archive, private plot, itinerary, search, and exports survived a service-worker-controlled reload with the browser network disabled.
- Update: a verifier server served the exact candidate, then only changed the SW version token. The app displayed `A fresh atlas is ready`; activating `Update now` reloaded under the new worker and replaced the old cache with `field-atlas-v1.0.2-shell` on desktop and mobile.
- The offline status indicator is inaccurate after the tested cached reload: it returned to `Online` even while Playwright networking remained disabled.

## Performance, origins, attribution, and live parity

Production artifact sizes:

| Asset | Uncompressed bytes | Budget/result |
|---|---:|---|
| Initial inline JS | 65,995 | PASS, ≤ 200 KB |
| Initial inline CSS | 15,312 | PASS, ≤ 50 KB |
| Whole initial HTML | 81,926 | 31,040 bytes transferred with compression |
| Import worker | 5,150 | Lazy on import |
| Fonts | 0 | PASS |
| Leaflet JS/CSS | 150,016 / 15,607 | Lazy, but currently unreachable due defect |

Live mobile Lighthouse: Performance **100**, Accessibility **100**, Best Practices **100**; FCP **1.0 s**, LCP **1.0 s**, TBT **50 ms**, CLS **0.045**, Speed Index **1.0 s**. This empty/modal audit does not supersede the populated-state axe failure.

The live root returned HTTPS 200, `text/html`, HSTS, CSP, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and a restrictive Permissions Policy. Root, privacy, terms, manifest, SW, offline page, icons, parser worker, and correctly located Leaflet assets returned 200.

SHA-256 comparison showed the live artifact matches the clean candidate. Representative hashes:

| File | Candidate = live SHA-256 |
|---|---|
| `index.html` | `2a9087bb4a9dc3716fb0fa0fb6a401ba0824e4e803a8acd9d47432f914e070fc` |
| `sw.js` | `e8d19c3136b587cc57880394f4ea94ddd1009bf606c9f37f61a83a56cc846b5c` |
| `manifest.webmanifest` | `847415c0b8a0a12422bd441a21adadbee04789e21e41b24514e0a65482252006` |
| parser worker | `b1a7401d23a5020f02517364fbed14e94f4c92b3870f86fea57566fcc8d75971` |
| Leaflet JS at `/assets/...` | `b499b3ec264901907b23109b2a32beb7db18dd88d6eec73740e2b3a4c0733c36` |

All compared icons and the Leaflet CSS also matched. Initial-load request capture found only the product origin. OSM attribution exists in source but is not reachable at runtime because Street Tiles fails before Leaflet initializes.

## Prioritized defects

### P0 — release blocker: populated calendar has a critical axe violation

`src/components/MonthCalendar.svelte` gives the day container `role="grid"` but places native buttons directly beneath it. Axe 4.13 reports `aria-required-children` with critical impact on both desktop and Pixel 7. The same widget ignores arrow keys despite claiming grid semantics. Either implement the complete grid/row/gridcell keyboard pattern or remove the inappropriate grid role and keep a simpler button group.

### P1 — Street Tiles is broken and OSM attribution never appears

`vite.config.ts` inlines the main JS into root `index.html` without rewriting its relative dynamic import. The compiled code imports `./leaflet-src-Byf149Wh.js`, which resolves to `/leaflet-src-Byf149Wh.js`; live returns 404. The actual file is `/assets/leaflet-src-Byf149Wh.js` and returns 200. The UI falls back with `Street tiles could not be loaded`, makes zero OSM requests, and never renders attribution. Reproduce by importing any coordinate fixture and enabling Street Tiles.

### P1 — every successful file-picker import emits an uncaught page error

Desktop and mobile report `Cannot set properties of null (setting 'value')`. In `chooseFile`, `event.currentTarget` is read after awaiting `importFile`; the event's `currentTarget` has been cleared by then. The archive still imports, but this violates the no-console/page-error quality gate and can destabilize automation. Capture the input element before the `await`.

### P2 — offline status becomes inaccurate after a cached reload

Immediately after `context.setOffline(true)`, the existing suite sees `Offline`; after a service-worker-cached reload, the independent run measured `navigator.onLine: true` and rendered `● Online` although browser networking was still disabled. Core offline data access works. Treat the badge as connection-state guidance only or validate connectivity rather than relying solely on the initial `navigator.onLine` value.

### P2 — first-load SW claim can race the privacy dialog

In combined parallel runs, the installing worker's `clients.claim()` triggered the unconditional `controllerchange → location.reload()` while the first-run privacy dialog was active. Twice, the dialog reopened and intercepted later input/error interactions. Isolated reruns passed. Avoid reloading on the initial claim; reload only after an explicit update activation.

## Decision

Do not promote this candidate as verified. Fix P0 and both P1 defects, add regression coverage that imports data before axe/console auditing, then rerun the live parity, privacy, PWA, and offline matrix. The core local-first workflow and privacy posture are sound enough to retain.
