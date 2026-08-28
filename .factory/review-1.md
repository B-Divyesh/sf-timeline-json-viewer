# Adversarial first-read review 1 — Field Atlas

**Verdict: FAIL**

Date: 2026-08-28 UTC
Work order: `timeline-json-viewer-review-1`
Candidate: `592e17a325c51af80699a3da0f5ee28b43da2b56`
Live site: <https://timeline-json-viewer.sociobot.in>

The product is not acceptable under this review contract. A cold visitor first sees a privacy gate that does not explain the actual job or intended user. There is no sample-data demo, `.factory/claims.json`, or demo sandbox. Unknown URLs return the importer with HTTP 200 instead of a designed 404. The local product checks pass, but the required first-read, demonstrability, claim accountability, and routing checks do not.

## Cold first screen

Fresh Chromium contexts were used at 390 × 844 and 1440 × 900. No storage or cookies were carried between contexts. Before scrolling, both contexts showed the same modal over the landing page:

> BEFORE YOU OPEN AN ARCHIVE
> Your movements stay on this device.
> Field Atlas has no server, account, analytics, or sync. It reads and saves your timeline only inside this browser. The private map makes no network requests.
> If you later enable optional OpenStreetMap tiles, tile requests reveal the viewed area and your IP address to OpenStreetMap—not your JSON file.
> Continue privately

From that first screen:

| Question | First-read answer |
|---|---|
| What does this do? | Not clear. It mentions reading and saving a timeline and a private map, but not browsing exported Google Timeline days, visits, or trips. |
| For whom? | Not stated. The modal does not name people who have a Google Timeline export they cannot open. |
| What should I click first? | “Continue privately” is the only available action, but it does not name the result. |

After dismissing the modal, the landing screen does explain the import job and shows “Choose Timeline JSON.” That clarification arrives one click too late for the mandatory cold first screen. On mobile, the headline, format sentence, primary file action, size limit, and three facts fit before the first major section break.

## Findings — blocking

### F-1-1 — The cold first screen does not identify the job or user

- **Location/quote:** first-visit modal; “Your movements stay on this device.” and “Continue privately.”
- **Why this fails:** a visitor cannot say that the product browses a Google Maps Timeline export or that it is for someone holding an export they cannot open. The privacy gate obscures the clearer landing headline in both tested viewports.
- **Fix:** do not gate the first screen. Put privacy facts inline. Show “Browse your exported Google Timeline” as the h1, “For people with a Timeline JSON file they cannot open” as the supporting sentence, and “Try it with sample data” beside “Open Timeline JSON.” If consent text remains necessary, show it only when the visitor opens a real file.

### F-1-2 — There is no one-click demo or isolated demo storage

- **Location/quote:** landing page has only “Open JSON” and “Choose Timeline JSON.” `/demo` and `/?demo=1` render the same empty importer.
- **Evidence:** after opening `/demo` and dismissing the modal, `.workspace` was absent and `.welcome` was present. There was no “Demo — sample data, nothing is saved” banner, “Reset demo,” or “Start for real.” The route wrote `field-atlas-privacy-seen` to the ordinary localStorage namespace and opened the ordinary `field-atlas-v1` IndexedDB database.
- **Why this fails:** the visitor cannot see realistic output without supplying sensitive data. There is no boundary that could prove demo actions leave real data untouched.
- **Fix:** add a first-screen “Try it with sample data” action and a real `/demo` route. Seed realistic multi-day visits and trips, open directly into the calendar/map/ledger, keep demo state under a `demo:` namespace or in memory, add the required persistent banner and reset/exit controls, and document it in `.factory/demo.md`.

### F-1-3 — The required claim registry and tagged claim tests do not exist

- **Location:** `.factory/claims.json` is absent; `rg "@claim"` found no claim-tagged tests.
- **Why this fails:** there were zero declared claim commands to run from the clean clone. Every product, offline, privacy, format, size, and export promise is therefore unregistered and untested under the required sandbox protocol. Existing unit and browser tests do not satisfy the one-entry/one-tag rule.
- **Fix:** create `.factory/claims.json`; give each retained claim one observable `@claim:<id>` test that starts through `/demo`; include request-log tests for privacy, offline reload tests, exact export assertions, supported-schema fixtures, and the quantitative 200 MB behavior. Remove claims that cannot be tested.

### F-1-4 — Unknown routes silently render the product as HTTP 200

- **Location/evidence:** `/404` and `/definitely-not-a-route` returned HTTP 200, title “Field Atlas — Local Timeline JSON viewer,” and the normal empty importer. `public/staticwebapp.config.json` has only a navigation fallback and no 404 response override.
- **Why this fails:** broken links look valid and visitors receive no explanation or route home. This is broken routing under the site-structure contract.
- **Fix:** add a designed Field Atlas 404 page with a clear “Return to Field Atlas” link and configure a real 404 response override. Add an end-to-end test that asserts the status, title, h1, and return action.

## Findings — major

### F-1-5 — The h1 is the brand, not the page headline

- **Location/quote:** every route uses `<h1>Field Atlas</h1>` in the header. The landing job is an h2; Privacy and Terms also start their content at h2.
- **Why this fails:** the only h1 does not describe the page job, and legal-page heading outlines begin with a brand unrelated to the page title.
- **Fix:** render the wordmark without an h1. Make “Browse your exported Google Timeline,” “How Field Atlas handles your data,” and “Terms of use” the respective route h1 headings.

### F-1-6 — Required social, canonical, and icon metadata is missing

- **Location:** live `<head>` on `/`, `/privacy`, and `/terms`.
- **Evidence:** the title and meta description exist, but there is no canonical link, Open Graph metadata, Twitter card metadata, SVG favicon, or 180 px apple-touch icon. `/demo` also reuses the root title instead of “Demo — Field Atlas.”
- **Fix:** add route-correct canonical URLs and titles, OG/Twitter title and description, a real 1200 × 630 product-art image, SVG favicon, and apple-touch icon. Test the metadata on every route.

### F-1-7 — Route changes do not move or announce focus

- **Location/evidence:** after following Privacy from the footer, `document.activeElement` was `BODY`; it was also `BODY` after Back. No route-title live region exists. Back did restore the prior scroll position.
- **Why this fails:** keyboard and screen-reader users receive no programmatic indication that new content loaded.
- **Fix:** use route navigation that moves focus to the new h1 and announces it through a polite live region. Add forward, back, deep-link, focus, and scroll-restoration tests.

### F-1-8 — `robots.txt` and `sitemap.xml` are not real files

- **Location/evidence:** both URLs return HTTP 200 with `text/html` and the 83,732-byte app shell because the navigation fallback catches them.
- **Why this fails:** crawlers receive misleading content instead of crawl directives or a route list.
- **Fix:** ship valid plain-text `robots.txt` and XML `sitemap.xml` files and exclude them from the SPA fallback.

### F-1-9 — The landing-page skeleton is incomplete

- **Location:** `/`, header, and footer.
- **Evidence:** there is no Demo link in the header, no product/live preview, no three-step “How it works” section, and no inline “What it does not do / privacy” section after the first screen. The footer omits “Built by Param Factory” and a version/build id.
- **Why this fails:** visitors cannot inspect the product before importing and cannot scan the standard information sequence.
- **Fix:** add the required demo-led preview, three concrete steps, privacy/limits section, header Demo and Privacy links, and complete footer. Keep the current archival-atlas visual system.

### F-1-10 — The brief’s KML export opportunity is missing

- **Location:** `.factory/brief.json` names “CSV/GPX/KML export”; the workspace offers only “Export CSV” and “Export GPX.”
- **Why this fails:** KML is the obvious map-native handoff for Google Earth and other mapping tools, and the researched gap explicitly names it.
- **Fix:** add “Export KML” for the selected date range, with names, timestamps, points, and paths. Add a realistic demo action and an exact `@claim:kml-export` fixture test. No AI feature is warranted for this private local viewer, and sync would conflict with the stated local-only scope.

### F-1-11 — The full production browser suite was not stable in one clean run

- **Location/evidence:** `TARGET_URL=https://timeline-json-viewer.sociobot.in npx playwright test --workers=1` passed 9/12. Two desktop cases timed out during `page.goto('/')` with `net::ERR_ABORTED`; one mobile offline case timed out waiting for `navigator.serviceWorker.ready`. Each failed case passed immediately when rerun alone.
- **Why this fails:** the focused passes show the core behaviors work, but the shipped production verification is not deterministic enough to be the release evidence claimed in the README.
- **Fix:** identify and remove the navigation/service-worker readiness race, then require two consecutive full live-suite passes from fresh contexts.

### Unlisted claim findings

All findings below lack any `.factory/claims.json` entry. Each sentence is something a visitor could rely on. Add the named test and registry entry, or remove/rewrite the claim.

| ID | Exact quote and location | Why it is unverified | Concrete fix |
|---|---|---|---|
| F-1-12 | Landing kicker: “works offline” | Offline is a product promise. | Add `@claim:offline-reload` using `/demo`, then reload while offline. |
| F-1-13 | Landing: “Open Google Timeline.json, legacy Records.json, or a Takeout file with timelineObjects.” | It promises three import variants. | Add `@claim:import-formats` with all three fixtures and assert rendered entries. |
| F-1-14 | Landing: “Parsing and storage stay in this browser.” | This is a privacy and persistence promise. | Add `@claim:local-processing` with a request log and storage inspection. |
| F-1-15 | Landing: “or drop one file here · up to 200 MB” | The 200 MB limit is quantitative. | Add `@claim:file-size-limit` at the boundary and above it. |
| F-1-16 | Landing fact: “No upload or account” | Visitors may select the tool because of this. | Add `@claim:no-upload` for the whole demo flow and assert no account path exists. |
| F-1-17 | Landing fact: “Browse after going offline” | This promises retained data and an offline shell. | Cover browse, search, map text, and reload in `@claim:offline-reload`. |
| F-1-18 | Landing fact: “Export CSV or GPX” | Visible buttons are not evidence that downloads are correct. | Add separate `@claim:csv-export` and `@claim:gpx-export` tests with exact rows/points. |
| F-1-19 | Modal heading: “Your movements stay on this device.” | This is a broad privacy promise. | Replace with a precise statement and cover it in `@claim:no-location-upload`. |
| F-1-20 | Modal: “Field Atlas has no server, account, analytics, or sync.” | Network architecture is relied on for sensitive data. | Add a source/request audit claim or narrow the sentence to what the test proves. |
| F-1-21 | Modal: “It reads and saves your timeline only inside this browser.” | Local persistence is unregistered. | Add `@claim:local-persistence` and inspect IndexedDB plus reload. |
| F-1-22 | Modal: “The private map makes no network requests.” | This is a specific network promise. | Add `@claim:private-map-network` and assert no request when days change. |
| F-1-23 | Modal: “If you later enable optional OpenStreetMap tiles, tile requests reveal the viewed area and your IP address to OpenStreetMap—not your JSON file.” | The exact external-request boundary is unregistered. | Add `@claim:osm-only` and assert the one allowed origin and absence of source payload. |
| F-1-24 | README: “Field Atlas turns Google Maps Timeline exports back into browsable days, visits, trips, and paths.” | This is the core outcome. | Add `@claim:import-browse` and assert all four rendered record types. |
| F-1-25 | README: “It is for people with legacy Google Location History Takeout files or post-2025 on-device exports who want a maintained viewer without uploading an intensely private file.” | “Maintained” and “without uploading” are reliance claims. | Delete “maintained”; cover the no-upload statement with `@claim:no-upload`. |
| F-1-26 | README: “Opens Timeline.json, legacy timelineObjects Takeout JSON, and raw Records.json/locations exports up to 200 MB.” | It combines format and size claims. | Split it and add `@claim:import-formats` plus `@claim:file-size-limit`. |
| F-1-27 | README: “Detects semanticSegments, timelineObjects, and raw record structures in a dedicated Web Worker so the interface remains responsive.” | Detection and responsiveness are both promised. | Split it; test each schema and define a measurable UI-heartbeat threshold. |
| F-1-28 | README: “Provides a month calendar, day ledger, place/activity search, private coordinate plot, and a complete text alternative for the map.” | This promises a complete feature and accessibility set. | Add a demo workflow test covering each output and the text alternative. |
| F-1-29 | README: “Optionally lazy-loads OpenStreetMap street tiles with attribution.” | Loading behavior and attribution are observable claims. | Add `@claim:street-tiles` and assert opt-in requests plus visible attribution. |
| F-1-30 | README: “Tiles are off by default.” | Default privacy state matters. | Add `@claim:tiles-default-off` in a fresh context. |
| F-1-31 | README: “Exports a chosen date range as CSV or GPX.” | Range filtering and file content are promised. | Add exact range/content assertions to the two export claim tests. |
| F-1-32 | README: “Saves the normalized archive in IndexedDB and installs as a PWA, so browsing, search, the ledger, private map, and exports survive refresh and work offline.” | This is a compound persistence/offline promise. | Split it and test every named retained behavior through `/demo`. |
| F-1-33 | README: “No source content, extracted coordinates, searches, or exports are sent to a server.” | This is the central privacy claim. | Add `@claim:no-private-data-request` covering import, search, map, export, and reload. |
| F-1-34 | README: “There is no account, analytics, tracking, sync, backend, CDN script, or remote font.” | The absence of external systems is unregistered. | Add a build/source audit and full-flow origin allowlist test. |
| F-1-35 | README: “Field Atlas supports the fields covered by the synthetic fixtures in `tests/fixtures`: semantic visits/activities/timeline paths, legacy place visits/activity segments/waypoints, and E7 raw records.” | Schema coverage is a compatibility promise. | Add one tagged claim test per supported schema family. |
| F-1-36 | README: “Unrecognized empty items are skipped with a warning; it does not claim complete coverage of every Google variation.” | The warning behavior is promised. | Add `@claim:unsupported-warning` and assert the visible warning and retained valid entries. |
| F-1-37 | README: “The file is read and `JSON.parse`d in a worker, keeping that cost off the main thread, but the parsed object must still fit browser memory.” | Worker execution and main-thread responsiveness are observable. | Add a worker-use assertion and measurable UI-heartbeat test, or state only the memory limit. |
| F-1-38 | README: “Files over 200 MB are rejected.” | This repeats the quantitative boundary. | Register it under `@claim:file-size-limit`. |
| F-1-39 | README: “Source offset dates and wall-clock times are preserved for day grouping; epoch-only records use their ISO/UTC representation.” | Date grouping is a correctness promise. | Add `@claim:source-time-preservation` with offset-boundary fixtures. |

## Findings — minor copy and resilience

| ID | Exact quote/location | Flag and first-reader impact | Proposed rewrite or fix |
|---|---|---|---|
| F-1-40 | Landing: “Open Google Timeline.json, legacy Records.json, or a Takeout file with timelineObjects.” | `timelineObjects` is implementation jargon on the first screen. | “Open Timeline.json, Records.json, or a legacy Google Takeout file.” |
| F-1-41 | Landing kicker: “Private recovery desk · works offline” | “Recovery desk” is a metaphor, and the line combines mood with an untested claim. | “Browse your exported Timeline offline.” |
| F-1-42 | Footer: “Field Atlas · your timeline stays yours” | This is a slogan, not concrete footer information. | “Field Atlas reads Timeline JSON in your browser.” |
| F-1-43 | Landing art: “PARSED LOCALLY 47.0000° N — 08.0000° E” | The invented coordinates are decorative data and can be mistaken for a real example. | Keep “Parsed in this browser”; remove the fake coordinates. |
| F-1-44 | Header “Open JSON” versus hero “Choose Timeline JSON” | The same first action uses two names. | Use “Open Timeline JSON” in both places. |
| F-1-45 | Modal button: “Continue privately” | It does not name what appears after activation. | “Open the private viewer.” |
| F-1-46 | “archive,” “export,” “file,” “Timeline JSON,” and “local archive” | The source and the browser-saved result are both called an archive. | Use “Timeline JSON” for the source file and “saved timeline” for parsed browser data. |
| F-1-47 | Privacy heading: “Privacy is the architecture” | This is an abstract slogan rather than a section name. | “How Field Atlas handles your data.” |
| F-1-48 | README line 3, second sentence (26 words) | Over 22 words; “maintained” and “intensely private” add unsupported emphasis. | “Field Atlas is for people with Google Timeline exports they cannot open. It handles legacy Takeout and post-2025 on-device files without uploading them.” |
| F-1-49 | README line 10 | `semanticSegments`, `timelineObjects`, and “dedicated Web Worker” are unexplained jargon. | “Recognizes Google’s old and new export formats in a background task, so the page stays usable during import.” |
| F-1-50 | README line 11 | “day ledger” and “private coordinate plot” are product metaphors rather than familiar feature names. | “Shows a month calendar, daily entries, place and activity search, a coordinate map, and the same map details as text.” |
| F-1-51 | README line 12 | “lazy-loads” is implementation jargon. | “Loads OpenStreetMap street tiles only when you turn them on. Tiles are off by default.” |
| F-1-52 | README line 14 (25 words) | Over 22 words and uses `IndexedDB`, `PWA`, and “normalized archive” without need. | “Saves the parsed timeline in this browser. Browsing, search, maps, and exports still work after a refresh or offline.” |
| F-1-53 | README line 16 | “CDN script” is technical shorthand in user-facing privacy copy. | “There is no account, tracking, sync, remote code, or web font.” |
| F-1-54 | README line 20, second sentence (23 words) | Over 22 words and exposes fixture/schema jargon without explaining it. | “Tests cover named visits, activities, routes, waypoints, and raw coordinates in Google’s old and new formats.” |
| F-1-55 | README line 22, first sentence (25 words) | Over 22 words; `JSON.parse`, “main thread,” and parsed-object memory are unnecessarily dense. | “The browser reads the file in a background task. The decoded data must still fit in browser memory.” |
| F-1-56 | README line 40, second sentence (38 words) | Over 22 words and packs many unrelated test details into one sentence. | “The browser tests cover desktop and mobile. They verify file import, keyboard use, map credit, saved data, offline reloads, console errors, and accessibility.” |
| F-1-57 | Service-worker-disabled browser context | Import succeeded, but the console reported `Cannot read properties of undefined (reading 'waiting')` from registration setup. | Catch registration failure/absence, keep the app usable without a service worker, and add a no-service-worker console test. |
| F-1-58 | Footer link: “Source” | The external GitHub destination is not identified as external. | “Source code on GitHub (opens in a new site)” or an equivalent accessible label. |
| F-1-59 | All routes: “Skip to timeline” | On Privacy and Terms, the target is legal content rather than a timeline. | “Skip to main content.” |

## Copy audit

Word counts treat hyphenated terms and filenames as one word and do not count punctuation separators.

### Landing-page sentences

| Words | Sentence | Result |
|---:|---|---|
| 9 | “Turn an export back into days you can browse.” | Clear after the modal is dismissed. |
| 11 | “Open Google Timeline.json, legacy Records.json, or a Takeout file with timelineObjects.” | F-1-13, F-1-40. |
| 7 | “Parsing and storage stay in this browser.” | F-1-14. |
| 6 | “Your movements stay on this device.” | F-1-1, F-1-19. |
| 9 | “Field Atlas has no server, account, analytics, or sync.” | F-1-20. |
| 10 | “It reads and saves your timeline only inside this browser.” | F-1-21. |
| 7 | “The private map makes no network requests.” | F-1-22. |
| 22 | “If you later enable optional OpenStreetMap tiles, tile requests reveal the viewed area and your IP address to OpenStreetMap—not your JSON file.” | At the cap; F-1-23. |

### Landing headings, labels, facts, and actions

| Words | Copy | Result |
|---:|---|---|
| 3 | “Local timeline viewer” | Clear. |
| 5 | “Private recovery desk · works offline” | F-1-12, F-1-41. |
| 9 | “or drop one file here · up to 200 MB” | F-1-15. |
| 4 | “No upload or account” | F-1-16. |
| 4 | “Browse after going offline” | F-1-17. |
| 4 | “Export CSV or GPX” | F-1-18. |
| 2 | “Archive contents” | Clear. |
| 4 | “Visits and named places” | Clear. |
| 3 | “Trips and paths” | Clear. |
| 3 | “Raw location records” | Clear. |
| 5 | “Before you open an archive” | F-1-46. |
| 6 | “Field Atlas · your timeline stays yours” | F-1-42. |
| 2 | “Open JSON” | F-1-44. |
| 3 | “Choose Timeline JSON” | F-1-44. |
| 2 | “Continue privately” | F-1-45. |
| 4 | “Read the privacy policy” | Clear. |

### README sentences

| Words | Sentence | Result |
|---:|---|---|
| 15 | “Field Atlas turns Google Maps Timeline exports back into browsable days, visits, trips, and paths.” | F-1-24. |
| 26 | “It is for people with legacy Google Location History Takeout files or post-2025 on-device exports who want a maintained viewer without uploading an intensely private file.” | F-1-25, F-1-48. |
| 14 | “Opens Timeline.json, legacy timelineObjects Takeout JSON, and raw Records.json/locations exports up to 200 MB.” | F-1-26. |
| 17 | “Detects semanticSegments, timelineObjects, and raw record structures in a dedicated Web Worker so the interface remains responsive.” | F-1-27, F-1-49. |
| 19 | “Provides a month calendar, day ledger, place/activity search, private coordinate plot, and a complete text alternative for the map.” | F-1-28, F-1-50. |
| 7 | “Optionally lazy-loads OpenStreetMap street tiles with attribution.” | F-1-29, F-1-51. |
| 5 | “Tiles are off by default.” | F-1-30. |
| 9 | “Exports a chosen date range as CSV or GPX.” | F-1-31. |
| 25 | “Saves the normalized archive in IndexedDB and installs as a PWA, so browsing, search, the ledger, private map, and exports survive refresh and work offline.” | F-1-32, F-1-52. |
| 13 | “No source content, extracted coordinates, searches, or exports are sent to a server.” | F-1-33. |
| 13 | “There is no account, analytics, tracking, sync, backend, CDN script, or remote font.” | F-1-34, F-1-53. |
| 11 | “See the in-app /privacy page for the exact optional tile behavior.” | Clear. |
| 8 | “Google does not publish a stable export schema.” | Clear context. |
| 23 | “Field Atlas supports the fields covered by the synthetic fixtures in tests/fixtures: semantic visits/activities/timeline paths, legacy place visits/activity segments/waypoints, and E7 raw records.” | F-1-35, F-1-54. |
| 18 | “Unrecognized empty items are skipped with a warning; it does not claim complete coverage of every Google variation.” | F-1-36. |
| 25 | “The file is read and `JSON.parse`d in a worker, keeping that cost off the main thread, but the parsed object must still fit browser memory.” | F-1-37, F-1-55. |
| 6 | “Files over 200 MB are rejected.” | F-1-38. |
| 8 | “Keep the original JSON as your authoritative backup.” | Clear instruction. |
| 17 | “Source offset dates and wall-clock times are preserved for day grouping; epoch-only records use their ISO/UTC representation.” | F-1-39. |
| 5 | “Requires Node.js 20 or newer.” | Clear developer requirement. |
| 10 | “npm run build creates the deployable static site in dist/.” | Confirmed locally. |
| 38 | “The browser suite covers desktop and Pixel-sized mobile, import through the real file chooser, calendar keyboard navigation, production Leaflet asset loading and attribution, persistence, first-install privacy stability, a service-worker-controlled offline reload, console errors, and populated-state serious/critical axe violations.” | F-1-11, F-1-56. |
| 11 | “npm run check:bundle enforces the initial-load JavaScript, CSS, and font budgets.” | Confirmed locally. |
| 10 | “Deploy the contents of dist/ to Azure Static Web Apps.” | Clear instruction. |
| 16 | “public/staticwebapp.config.json is copied into the build and supplies SPA routes, security headers, and manifest MIME types.” | Clear for the developer audience. |
| 10 | “Deployment infrastructure, DNS, and billing intentionally live outside this repository.” | Clear. |
| 6 | “.factory/brief.json records the researched product opportunity.” | Clear. |
| 11 | “.factory/design.md records the product-specific archival field-atlas visual system and asset provenance.” | Clear. |
| 7 | “.factory/handoff.md records release verification and known limits.” | Clear. |
| 5 | “Licensed under the MIT License.” | Clear. |

README headings “What it does,” “Supported data and limits,” “Run and verify,” “Deploy,” and “Project notes” all name their sections without context. No banned plain-words term appears. The flagged problems are length, unexplained technical language, unsupported adjectives, and compound claims.

### Terminology table

| Concept | Current words | Required single term |
|---|---|---|
| User-supplied source | export, file, JSON, archive, Timeline JSON | **Timeline JSON** |
| Parsed browser copy | normalized archive, local archive, timeline | **saved timeline** |
| Timeline item | entry, visit, trip, path, record | Keep **entry** as the umbrella; use visit/trip/path only for actual types. |
| Base map mode | private map, coordinate plot, private coordinate plot | **coordinate map** |
| Optional remote map | Street tiles, OpenStreetMap street tiles | **OpenStreetMap tiles** |

## Demo, sandbox, privacy, and offline evidence

- `/demo` and `/?demo=1` do not enter demo mode; see F-1-2.
- A fresh `/demo` request log contained only same-origin GETs, but this is the empty production importer, not a demo flow.
- A normal live import/search flow using `tests/fixtures/semantic.json` generated 15 GET requests, all to `https://timeline-json-viewer.sociobot.in`; there were no request bodies, no external origins, no fixture place name or literal coordinate in a URL/body, and no console error.
- The focused desktop and mobile offline-reload tests passed live. Because there is no demo, offline and privacy could not be verified through the required sample-data sandbox.
- With service workers explicitly blocked, import still rendered data but the registration path logged the error in F-1-57.

## Claim-test and quality-gate results

No `.factory/claims.json` exists, so the number of declared claim tests was **zero**. That is not a pass; it is F-1-3.

A clean local clone at candidate commit `592e17a` produced:

| Command | Result |
|---|---|
| `npm ci` | PASS — 91 packages, 0 vulnerabilities |
| `npm run check` | PASS — 0 errors, 0 warnings |
| `npm test` | PASS — 7/7 |
| `npm run build` | PASS — `dist/` produced |
| `npm run check:bundle` | PASS — initial JS 67,801 B; CSS 15,312 B; fonts 0 B |
| `npm run test:e2e` | PASS — 12/12 |
| `npm run test:axe` | PASS — 2/2 populated-state tests |
| Full live suite, serial | FAIL — 9/12; all three failures passed on focused rerun (F-1-11) |

No error-level console message occurred on ordinary cold mobile/desktop loads. The root has `lang="en"`, one h1, a main landmark, focus styles, reduced-motion coverage, and passing serious/critical axe checks. The h1 content still fails the page-heading contract (F-1-5).

## Route, link, and visual checks

| Check | Result |
|---|---|
| Root title | PASS — “Field Atlas — Local Timeline JSON viewer” |
| Privacy/Terms titles | PASS — “Privacy — Field Atlas” / “Terms — Field Atlas” |
| `/demo` title | FAIL — root title; no demo route |
| One h1 | Mechanical count passes; semantic headline requirement fails (F-1-5) |
| Meta description | PASS — 76 characters |
| Canonical/OG/Twitter/apple icon | FAIL — F-1-6 |
| 404 | FAIL — F-1-4 |
| `robots.txt` / `sitemap.xml` | FAIL — F-1-8 |
| Deep links | Privacy and Terms reload correctly |
| Back button | Returns to root and restores scroll |
| Route focus/announcement | FAIL — F-1-7 |
| Link crawl | Root, Privacy, Terms, icon, and GitHub source returned 200; external label fails F-1-58 |
| Header/footer contract | FAIL — F-1-9 |
| Visual identity | PASS — the warm paper, dark drafting table, ruled ledger, cartographic marks, rust/water/meadow palette, and restrained motion are recognizably product-specific rather than a generic SaaS template |

## Earlier-history verification

There were no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read `.factory/handoff.md`, `.factory/verification.md`, and `.factory/verification-2.md`. Each previously reported repair was checked again in source and on live:

| Earlier finding | Code confirmation | Live confirmation | Result |
|---|---|---|---|
| Populated calendar critical ARIA issue | `MonthCalendar.svelte` uses a labelled native-button group and roving tab stop; no `grid` role | Populated axe and release-blocker test passed | Fixed |
| Arrow-key calendar navigation/focus | Arrow/Home/End/Page handlers remain in the component | March 1 → ArrowLeft → Feb 29 focus/selection test passed | Fixed |
| Broken Leaflet lazy asset path/attribution | Production build emits `/assets/leaflet-*`; map keeps OSM attribution | Desktop/mobile Street Tiles tests passed | Fixed |
| File-picker `currentTarget` null error | `chooseFile` captures `input` before awaiting import | Real chooser test passed without page/console errors | Fixed |
| Offline badge stale after cached reload | Same-origin connection probe and offline service-worker marker remain | Focused desktop/mobile offline reload passed | Fixed |
| First-install worker claim/privacy race | Reload is guarded by explicit `reloadForUpdate` | First-claim/privacy/offline release test passed | Fixed |

No prior finding is repeated under its old identifier.

## Missed leverage

KML export is the one clear missed feature; see F-1-10. AI summarisation or classification would add network/privacy cost without helping the core job of faithfully browsing and exporting a location record. Cross-device sync would contradict the product’s local-only trust model. Neither should be added merely for novelty.

## What would make this perfect

Resolve every finding above. The acceptance rerun should open a cold 390 px context and immediately show the job, user, sample action, real-file action, and three tested facts; enter a realistic isolated demo in one click; pass every registered claim test from that demo; return a designed 404 for unknown URLs; expose complete metadata and route focus; provide KML export; and pass the full live browser suite twice without retry. The current visual identity and repaired core import/browse/export behavior should be retained.
