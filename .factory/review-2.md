# Adversarial first-read review 2 — Field Atlas

**Verdict: FAIL**

Date: 2026-08-28 UTC
Work order: `timeline-json-viewer-review-2`
Reviewed commit: `a1ebd79fda6d47f6074bbeb87d603d28f8bf0009`
Live URL: <https://timeline-json-viewer.sociobot.in>

This review found three blocking claim-accountability regressions and two minor metadata defects. The cold first screen, one-click demo, core workflows, visual identity, declared claims, and primary routes otherwise verify.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 900, with no carried storage, showed the same usable first screen.

| Question | First-read answer |
|---|---|
| What does this do? | It browses an exported Google Timeline JSON file. |
| For whom? | “For people with a Timeline JSON file they cannot open.” |
| What should I click first? | “Try it with sample data”; the adjacent text says it opens the calendar, entries, map, and exports. |

The mobile first viewport contains the headline, audience, primary sample action, real-file action, result text, and the three privacy/offline/export facts. It passes this part of the first-read check.

## Findings — blocking

### F-1-21 — real saved-timeline persistence is claimed without a matching claim test (regression)

- **Location/quote:** `/privacy`: “Your saved timeline stays in this browser until you remove it or clear this site’s data.”
- **Why this fails:** this is a reliance claim about a real imported Timeline JSON. `local-persistence` covers only the demo store (`demo:field-atlas-v1`); all declared import tests run through `/?demo=1`. No claim test imports into the real scope, reloads, and observes the saved timeline. This repeats the unresolved scope of review-1 F-1-21 rather than proving it.
- **Concrete fix:** add a `real-local-persistence` entry to `.factory/claims.json` and a clean-context test that imports a fixture at `/`, reloads, verifies the rendered entries and `field-atlas-v1`, then removes it. Alternatively remove the sentence.

### F-1-23 — optional-tile privacy disclosure is not covered by its registered test (regression)

- **Location/quote:** `/privacy` and README: “Those requests reveal approximate map areas and your IP address, not your Timeline JSON.”
- **Why this fails:** `@claim:street-tiles` asserts an opt-in control and attribution after intercepting tile images. It does not record the real tile request, assert its GET/no-body boundary, or establish that a Timeline fixture, search, and export are absent from requests while tiles are enabled. This is the disclosure that review-1 F-1-23 required to be tested.
- **Concrete fix:** add a `tile-request-privacy` claim and request-log test: enable tiles in demo after importing/searching/exporting a fixture; assert only same-origin GETs plus GET image requests to `tile.openstreetmap.org`, no request body, and no fixture place/coordinate in URLs or bodies. Keep the disclosure only if that test passes.

### F-2-1 — “discarded when you start for real” is an unlisted demo claim

- **Location/quote:** `/privacy`: “The demo uses a separate browser store and is discarded when you start for real.”
- **Why this fails:** `@claim:demo-isolation` confirms the demo database name before exit, then only confirms that the landing heading appears. It does not inspect the demo record after **Start for real**. The reviewer manually confirmed the record is currently absent, but this cannot remain an undocumented manual assertion; the claim registry must prove it on every build.
- **Concrete fix:** add `demo-discard` to `claims.json` and assert that, after **Start for real**, `demo:field-atlas-v1` has no `archive/current` record, `demo:field-atlas-date` is absent, and `field-atlas-v1` was neither read nor written. Or delete “and is discarded when you start for real.”

## Findings — minor

### F-2-2 — route descriptions are duplicated; the first description is wrong for non-root routes

- **Location/evidence:** on live `/demo`, `/privacy`, and `/terms`, DOM inspection returns two `meta[name="description"]` tags. The first is the root static text: “Browse and export Google Maps Timeline JSON privately, in your browser.” The later Svelte tag contains route-specific copy where applicable.
- **Why this matters:** crawlers and sharing tools may select the first description. The demo and privacy pages therefore do not reliably expose their own description.
- **Concrete fix:** remove the static description from `index.html` and let `<svelte:head>` provide exactly one description per SPA route, or update a single existing element on route change. Add a route metadata test asserting exactly one description and its expected value for `/`, `/demo`, `/privacy`, and `/terms`.

### F-2-3 — the cold static 404 lacks required route metadata

- **Location/evidence:** cold `GET /not-a-real-page` correctly returns HTTP 404 and `404.html`, but that document has no meta description, canonical URL, Open Graph/Twitter metadata, or Apple touch icon.
- **Why this matters:** it is a real public route and is the page a visitor receives for a bad deep link. It does not meet the site metadata contract applied to every route.
- **Concrete fix:** add a short noindex description, canonical `/404` (or the selected 404 canonical policy), OG/Twitter title/description/image, and the existing Apple touch icon to `public/404.html`; assert them in the 404 route test.

## Copy audit

All landing and README sentences, headings, facts, and action labels are below. Word counts treat filenames and URLs as one word. No item exceeds 22 words. No banned marketing adjective, mood heading, empty slogan, or inconsistent product term was found. “Timeline.json” is a literal filename; “Timeline JSON” is the product term, so those uses are consistent. Buttons name results or actions: **Try it with sample data**, **Open Timeline JSON**, **Open the sample viewer**, **Reset demo**, **Start for real**, and the three export buttons.

### Landing page

| Words | Text | Result |
|---:|---|---|
| 3 | Local timeline viewer | Clear product label. |
| 5 | Browse your exported Google Timeline | Clear h1. |
| 10 | For people with a Timeline JSON file they cannot open. | Clear audience. |
| 5 | Try it with sample data | Clear primary action. |
| 3 | Open Timeline JSON | Clear real-data action. |
| 9 | The sample opens the calendar, entries, map, and exports. | Clear result. |
| 4 | Runs in your browser | Covered by local-only/browser workflow. |
| 6 | Sample works after the first visit | Covered by offline-reload. |
| 5 | Export CSV, GPX, or KML | Covered by export claims. |
| 4 | Visits and named places | Clear type label. |
| 3 | Trips and paths | Clear type label. |
| 3 | Raw location records | Clear type label. |
| 5 | See a sample timeline first | Informative heading. |
| 12 | The sample opens realistic visits, a walking route, and a cycling route. | Covered by import-browse/demo workflow. |
| 6 | It never reads your saved timeline. | Covered by demo-isolation. |
| 3 | Open the sample viewer | Clear action. |
| 3 | How it works | Informative heading. |
| 3 | Open a file | Informative step. |
| 9 | Choose Timeline.json, Records.json, or a legacy Google Takeout file. | Covered by import-formats. |
| 2 | Browse days | Informative step. |
| 12 | Find visits, trips, and raw records in the calendar and coordinate map. | Covered by import-browse. |
| 3 | Take a copy | Informative export step. |
| 10 | Export a selected date range as CSV, GPX, or KML. | Covered by export claims. |
| 6 | What Field Atlas does not do | Informative heading. |
| 8 | Street tiles stay off until you choose them. | Covered by tiles-default-off/street-tiles. |
| 7 | The sample never touches your saved timeline. | Covered by demo-isolation. |
| 9 | Read how local storage and optional map tiles work. | Clear link action. |
| 8 | Field Atlas reads Timeline JSON in your browser. | Supported by local-only and import workflow. |

### README

| Words | Text | Result |
|---:|---|---|
| 6 | Field Atlas — browse Google Timeline JSON | Clear title. |
| 13 | Field Atlas is for people with a Timeline JSON file they cannot open. | Clear audience. |
| 12 | It shows days, visits, trips, and coordinate-map details in the browser. | Covered by import-browse. |
| 11 | Try the isolated sample at timeline-json-viewer.sociobot.in/?demo=1. | Covered by demo-isolation. |
| 3 | What it does | Informative heading. |
| 8 | Opens Timeline.json, legacy Google Takeout JSON, and Records.json. | Covered by import-formats. |
| 9 | Shows visits, trips, coordinate-map text, and place search. | Covered by import-browse. |
| 10 | Exports a selected date range as CSV, GPX, or KML. | Covered by export claims. |
| 13 | Keeps the shipped sample available after refresh and offline after its first visit. | Covered by local-persistence/offline-reload. |
| 4 | Starts street tiles off. | Covered by tiles-default-off. |
| 9 | OpenStreetMap tiles load only after you turn them on. | Covered by street-tiles. |
| 10 | Rejects Timeline JSON files larger than 200 MB before parsing. | Covered by file-size-limit. |
| 10 | Field Atlas sends no Timeline JSON data to a server. | Covered by local-only. |
| 13 | The demo uses a separate browser store and never touches a saved timeline. | Covered by demo-isolation. |
| 10 | Read the in-app privacy page before opening personal data. | Clear link action. |
| 3 | Run and verify | Informative heading. |
| 5 | Requires Node.js 20 or newer. | Developer prerequisite. |
| 8 | Run every declared product claim from a clean clone. | Clear verification instruction. |
| 5 | npm run build creates dist/. | Clear build outcome. |
| 8 | Deploy that directory to Azure Static Web Apps. | Clear deployment instruction. |
| 12 | The service worker precaches the app shell and the shipped sample route. | Implementation note; observed offline behavior is covered by offline-reload. |
| 3 | Privacy and limits | Informative heading. |
| 15 | A saved timeline stays in this browser until you remove it or clear site data. | **F-1-21.** |
| 17 | OpenStreetMap tile images are optional and expose approximate viewed map areas and your IP address to OpenStreetMap. | **F-1-23.** |
| 4 | Google changes export formats. | Plain limitation. |
| 8 | Keep the original Timeline JSON as your backup. | Clear advice. |
| 3 | Project files | Informative heading. |
| 7 | .factory/claims.json lists every testable product claim. | Repository fact. |
| 7 | .factory/demo.md describes the isolated sample sandbox. | Repository fact. |
| 9 | .factory/design.md records the archival field-atlas visual system. | Repository fact. |
| 5 | .factory/handoff.md records release verification. | Repository fact. |
| 5 | Licensed under the MIT License. | Clear legal statement. |

## Demo and sandbox verification

- One click on **Try it with sample data** reached `/demo` and immediately displayed a populated calendar, two-day itinerary, visits, walking/cycling routes, coordinate map, search, and all three exports. The sample has five realistic entries.
- The persistent banner reads “Demo — sample data, nothing is saved” and includes **Reset demo** and **Start for real**. Reset restored the seeded sample.
- In a clean live context, the only database was `demo:field-atlas-v1` and the only local-storage item was `demo:field-atlas-date`. `field-atlas-v1` was absent. After **Start for real**, `archive/current` in the demo database was absent and the demo date key was removed. The missing automated coverage is F-2-1, not a failed observed behavior.
- Live demo requests were `GET /?demo=1`, `GET /online-check.txt`, and `GET /icons/atlas.svg`, all same-origin and bodyless. No console errors occurred. The registered local-only test also imported, searched, and exported a fixture while recording requests.
- The demo remained usable after first visit while offline in `@claim:offline-reload`.

## Claim registry and clean verification

`.factory/claims.json` contains 12 entries. From the clean reviewed working tree after `npm ci`, `npm run test:claims` ran all declared tags in desktop and mobile projects: **24/24 passed**.

| Claim IDs | Result |
|---|---|
| demo-isolation, offline-reload, import-formats, import-browse | PASS |
| csv-export, gpx-export, kml-export, local-only | PASS |
| tiles-default-off, street-tiles, local-persistence, file-size-limit | PASS |

Additional quality evidence:

| Command | Result |
|---|---|
| `npm ci` | PASS — 91 packages, 0 vulnerabilities |
| `npm run check` | PASS — 0 errors, 0 warnings |
| `npm test` | PASS — 7/7 |
| `npm run build` | PASS — `dist/` produced |
| `npm run check:bundle` | PASS — initial JS 73,573 B; CSS 17,130 B; fonts 0 B |
| `npm run test:e2e` | PASS — 34/34 |
| `npm run test:axe` | PASS — 2/2 serious/critical checks |

## Structure, routes, links, and visual identity

| Check | Result |
|---|---|
| Root title, language, one h1, main landmark, focus styles, reduced motion | PASS |
| Demo, Privacy, Terms route titles | PASS — `Demo — Field Atlas`, `Privacy — Field Atlas`, `Terms — Field Atlas` |
| Canonical, OG/Twitter card, SVG favicon, apple icon on SPA routes | PASS except duplicate descriptions (F-2-2) |
| Cold unknown route | PASS — HTTP 404 and a designed Field Atlas 404 with return link; metadata is incomplete (F-2-3) |
| Deep links, Back, h1 focus, polite announcement | PASS — exercised by route test |
| Header/footer, skip link, Privacy/Terms, build/factory footer | PASS |
| Crawl | PASS — `/`, `/demo`, `/privacy`, `/terms`, crawl files, favicon, social image, and GitHub source all returned 200 |
| Visual identity | PASS — the warm-paper ledger, drafting-table surround, cartographic marks, restrained map-route language, and ruled layout are specific to location-history recovery and not a generic SaaS template |

The brief does not imply an AI feature: it would add a network/privacy burden without improving faithful local browsing or export. The obvious missing map-native export from review 1, KML, is now present and tested. Sync would contradict the local-only scope.

## Earlier-history verification

All earlier documents (`review-1.md`, `polish-1.md`, verification records, and the prior handoff) were read. Each review-1 finding was checked in live behavior and source. “Fixed” below means verified, except the explicitly repeated blocking IDs.

| Earlier ID | Live and code confirmation | Status |
|---|---|---|
| F-1-1 | Cold h1/audience/actions are visible without a privacy gate. | Fixed |
| F-1-2 | `/demo`/`?demo=1`, seeded data, banner, reset, and isolated namespace exist. | Fixed |
| F-1-3 | 12-entry registry and tagged browser tests exist. | Fixed |
| F-1-4 | Cold unknown URL returns static HTTP 404 with return link. | Fixed |
| F-1-5 | Wordmark is not an h1; each route has a page h1. | Fixed |
| F-1-6 | Canonical, OG/Twitter, favicon, and Apple icon exist on SPA routes. | Fixed; see new F-2-2/F-2-3. |
| F-1-7 | `changeRoute` focuses/announces h1; back test passes. | Fixed |
| F-1-8 | `robots.txt` and `sitemap.xml` are real correctly typed files. | Fixed |
| F-1-9 | Demo nav, preview, three steps, limit/privacy section, and full footer exist. | Fixed |
| F-1-10 | KML export and exact claim test exist. | Fixed |
| F-1-11 | Full serial suite passed 34/34. | Fixed |
| F-1-12 | Offline sample fact has `offline-reload`. | Fixed |
| F-1-13 | Plain format copy has `import-formats`. | Fixed |
| F-1-14 | Local-only claim has request-log coverage. | Fixed |
| F-1-15 | 201 MB rejection has `file-size-limit`. | Fixed |
| F-1-16 | Unverifiable account assertion is absent. | Fixed |
| F-1-17 | Offline wording is demo-specific and tested. | Fixed |
| F-1-18 | CSV, GPX, and KML bytes are asserted. | Fixed |
| F-1-19 | Privacy-gate slogan is absent. | Fixed |
| F-1-20 | Unprovable architecture inventory is absent. | Fixed |
| F-1-21 | Real-scope persistence is again claimed without a matching test. | **Blocking recurrence** |
| F-1-22 | Default coordinate map has no tile requests. | Fixed |
| F-1-23 | Tile request privacy disclosure lacks the required request-log coverage. | **Blocking recurrence** |
| F-1-24 | Demo checks visits, trips, text itinerary, and search. | Fixed |
| F-1-25 | “Maintained” claim is absent. | Fixed |
| F-1-26 | Format and size claims are split and tested. | Fixed |
| F-1-27 | Unmeasured responsiveness promise is absent. | Fixed |
| F-1-28 | Browse output has one observable workflow. | Fixed |
| F-1-29 | Opt-in tile behavior has a claim test. | Fixed |
| F-1-30 | Default-off tile state has a claim test. | Fixed |
| F-1-31 | Exact range/export content tests exist. | Fixed |
| F-1-32 | Retained offline behavior is tested through demo. | Fixed |
| F-1-33 | Local-only flow logs import/search/export requests. | Fixed |
| F-1-34 | Unverifiable stack inventory is absent. | Fixed |
| F-1-35 | Three fixture families are imported. | Fixed |
| F-1-36 | Unsupported-item wording is limited; parser tests retain warning behavior. | Fixed |
| F-1-37 | Worker/responsiveness marketing promise is absent. | Fixed |
| F-1-38 | Size boundary is registered. | Fixed |
| F-1-39 | Untested source-offset promise is absent. | Fixed |
| F-1-40 | First-screen format wording avoids schema jargon. | Fixed |
| F-1-41 | Recovery-desk metaphor is absent. | Fixed |
| F-1-42 | Footer is factual. | Fixed |
| F-1-43 | Decorative fake coordinates are absent. | Fixed |
| F-1-44 | File action consistently says “Open Timeline JSON.” | Fixed |
| F-1-45 | Vague privacy-gate action is absent. | Fixed |
| F-1-46 | Timeline JSON/saved timeline terminology is consistent. | Fixed |
| F-1-47 | Privacy h1 is descriptive. | Fixed |
| F-1-48 | README audience copy is within the cap. | Fixed |
| F-1-49 | README removes schema/worker jargon. | Fixed |
| F-1-50 | README uses entries and coordinate map. | Fixed |
| F-1-51 | README uses opt-in tile wording. | Fixed |
| F-1-52 | Compound persistence/offline copy was split. | Fixed, except F-1-21 real-scope claim. |
| F-1-53 | README remote-stack jargon is absent. | Fixed |
| F-1-54 | README format prose is plain. | Fixed |
| F-1-55 | README parser implementation prose is absent. | Fixed |
| F-1-56 | README verification commands are short and executable. | Fixed |
| F-1-57 | Service-worker registration is caught; no-SW test passes. | Fixed |
| F-1-58 | GitHub link announces another site. | Fixed |
| F-1-59 | Skip link says “Skip to main content.” | Fixed |

## What would make this perfect

Register and test real saved-timeline persistence, demo discard, and optional-tile request privacy; then remove duplicate SPA descriptions and complete the static 404 metadata. Re-run the clean claim suite and the 34-case browser suite. With those five items resolved, the product would have no remaining finding in this review.
