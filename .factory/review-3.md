# Adversarial first-read review 3 — Field Atlas

**Verdict: FAIL**

Date: 2026-08-28 UTC

Work order: `timeline-json-viewer-review-3`

Reviewed commit: `9369cf53d871db563587a2750d90d9766edbc1f9`
Live URL: <https://timeline-json-viewer.sociobot.in>

The cold first screen is clear, the direct demo is useful, and every declared command passes. The release still fails. A client-side route change can put a real saved timeline beneath the banner “Demo — sample data, nothing is saved.” Demo links from Privacy and Terms open an empty importer instead of the sample. Back from Privacy can also replace a populated saved workspace with the importer until reload. These are live, reproducible state-boundary and routing failures that the permanent tests do not exercise.

## Cold first screen

Fresh Chromium contexts at 390 × 844 and 1440 × 900 were opened with no prior cookies, storage, or scrolling.

| Question | Answer from the first screen |
|---|---|
| What does this do? | It opens an exported Google Timeline JSON and lets me browse it, then export CSV, GPX, or KML. |
| For whom? | People with a Timeline JSON file they cannot open. |
| What should I click first? | **Try it with sample data**. The adjacent sentence says the sample opens the calendar, entries, map, and exports. |

The first-read test passes at both sizes. The exact useful text is “Browse your exported Google Timeline,” “For people with a Timeline JSON file they cannot open,” and “Try it with sample data.” The 390 px viewport includes those lines, both actions, the result sentence, and all three fact rows before scrolling. The required privacy/offline/price fact shape is still incomplete; see F-3-3.

## Findings — blocking

### F-3-1 — Demo mode can display a real saved timeline and can open empty from legal pages

- **Recurrence:** F-1-2; the claim coverage in F-1-3 is also only half-fixed.
- **Exact live location/quote:** after importing `semantic.json` at `/`, activate the header **Demo** link. The URL and title become `/demo` and “Demo — Field Atlas.” The banner says “Demo — sample data, nothing is saved” and “Explore the viewer without touching your saved timeline.” Directly below it, the archive name is **semantic.json**, with **2 entries · semanticSegments**. “Museum, Hall \"A\"” is present and the shipped “Juniper Cafe” sample is absent.
- **Second reproduction:** open `/privacy` or `/terms` in a clean context and activate **Demo**. `/demo` shows the landing importer, not the populated sample; no demo database exists.
- **Storage evidence:** in the first reproduction, IndexedDB contains only `field-atlas-v1`; `demo:field-atlas-v1` is absent. The page has therefore rendered the real dataset while claiming to be the isolated sample.
- **Code confirmation:** `src/App.svelte` lines 13–17 derive `demoMode`, `isLegal`, `scope`, and `dateKey` reactively. `changeRoute` changes `path` and immediately calls `initialize()` at lines 47–50. `initialize()` can therefore read the previous route's derived values at lines 33–36. From a real workspace it loads the real store; from a legal page it returns early.
- **Why this blocks:** demo mode is the trust boundary for sensitive location data. The product explicitly promises that the sample “never reads” or “never touches” a saved timeline. The visible result proves that promise false.
- **Why the green claim test is insufficient:** `@claim:demo-isolation` always starts directly at `/?demo=1` in a clean context. It never seeds `field-atlas-v1` and then enters Demo through the UI. It proves only the easiest entry path.
- **Concrete fix:** make route initialization use the destination path/query synchronously, or wait for derived route state before selecting a storage scope. Add cases to `@claim:demo-isolation` that first import a real fixture, snapshot the real store, enter Demo from the header, verify only sample records are rendered, reset/exit, and prove the real snapshot is unchanged. Add Privacy → Demo and Terms → Demo cases. Keep the same claim ID.

### F-3-2 — Back navigation drops a saved workspace until reload

- **Location/evidence:** import `semantic.json`, activate **Privacy**, then use browser Back. The URL, root title, h1 focus, and real IndexedDB database are present, but `.workspace` is absent and `.welcome` is shown. The saved `semantic.json` entries return only after a full reload.
- **Code confirmation:** the same stale derived-state call at `src/App.svelte:47–50` runs `initialize()` while `isLegal` still describes the route being left. It returns early and never reloads the saved timeline.
- **Why this blocks:** the Back button does not restore the prior product state. A visitor can reasonably conclude that their imported timeline disappeared. This is broken routing under the site-structure contract.
- **Concrete fix:** make destination state explicit during route changes. Add an end-to-end case that imports a fixture, navigates to Privacy, goes Back, and asserts the same archive, selected date, and entries are visible and the h1 is focused. Also verify forward navigation and **Start for real** when a real timeline already exists.

### F-3-3 — The first-screen fact set omits price and does not name offline behavior

- **Recurrence:** F-1-9 was marked fixed, but the mandatory first-screen skeleton remains incomplete.
- **Location/quote:** the three rows are “Runs in your browser,” “Sample works after the first visit,” and “Export CSV, GPX, or KML.”
- **Why this blocks:** the required three facts are privacy, offline behavior, and price. “Sample works after the first visit” does not say what changes after that visit, and no first-screen text says the product is free. A cold visitor cannot verify price or even identify the intended offline promise from these rows.
- **Concrete fix:** use three explicit facts such as “No Timeline JSON upload,” “Sample works offline after your first visit,” and “Free to use.” Keep export formats in the nearby result sentence or add a fourth fact. Retain the existing claim IDs for local-only and offline reload.

## Findings — major

### F-3-4 — The cold 404 omits the standard header, skip link, and footer

- **Location:** direct cold request to `/not-a-real-page`; `public/404.html`.
- **Evidence:** the server correctly returns HTTP 404 with the right title, h1, description, canonical, social image, favicon, and return link. The document contains only `<main>`; it has no Field Atlas header/navigation, skip link, footer, Privacy/Terms links, version, or “Built by Param Factory.”
- **Why this matters:** the site-structure contract requires the same header and footer on every route. This bad-link state looks like a reduced generic error page rather than the complete Field Atlas site.
- **Concrete fix:** give `404.html` the same wordmark/header, skip link, footer, legal links, version, and atlas visual details as the app. Extend the static-404 test to assert that shared structure, not metadata alone.

## Findings — minor

### F-3-5 — The documented query-string demo has the root canonical URL

- **Location/evidence:** `/?demo=1` has title “Demo — Field Atlas” and demo description, but canonical `https://timeline-json-viewer.sociobot.in/`. `/demo` correctly canonicalizes to `/demo`.
- **Why this matters:** README and `.factory/demo.md` publish `?demo=1` as a verifier entry point, so its metadata should identify the demo rather than the landing page.
- **Concrete fix:** set the canonical to `/demo` whenever `demoMode` is true. Add `/?demo=1` to the route metadata test.

### F-3-6 — “Realistic” is an unsupported marketing adjective

- **Location/quote:** landing preview: “The sample opens realistic visits, a walking route, and a cycling route.”
- **Why this matters:** “realistic” is subjective and tells the reader less than the actual sample contents.
- **Concrete rewrite:** “The sample includes three visits, a walking route, and a cycling route.” If the count is retained, assert it in the demo test.

### F-3-7 — “Take a copy” does not name the section result

- **Location/quote:** third “How it works” step: “Take a copy.”
- **Why this matters:** heard out of context as a heading, it does not name CSV, GPX, KML, or export.
- **Concrete rewrite:** “Export a date range.”

### F-3-8 — The README keeps an unlisted, jargon-heavy implementation claim

- **Location/quote:** README: “The service worker precaches the app shell and the shipped sample route.”
- **Why this matters:** “service worker,” “precaches,” and “app shell” are implementation jargon. The sentence also makes a specific product claim not listed verbatim in `claims.json`.
- **Concrete fix:** delete it because the preceding registered offline sentence already gives the useful outcome. Alternatively write “After the first online visit, the viewer and sample reload without a network connection” and cover that exact sentence with `offline-reload`.

### F-3-9 — “Map-image GETs” exposes protocol jargon in privacy copy

- **Location/quote:** README and `/privacy`: “Optional tile requests send map-image GETs, not Timeline JSON data.”
- **Why this matters:** a visitor should not need to know an HTTP method to understand what leaves the browser.
- **Concrete rewrite:** “Optional tile requests fetch map images. They never include Timeline JSON data.” Keep the existing request-method assertion in the claim test.

### F-3-10 — The same product label uses two names on the first screen

- **Location/quote:** header: “Local timeline viewer”; hero kicker: “Local Timeline JSON viewer.”
- **Why this matters:** the shorter label can sound like the product connects to live Google Timeline, while the second correctly names JSON files.
- **Concrete fix:** use “Local Timeline JSON viewer” in both places.

## Complete copy audit

Counts treat filenames, URLs, and hyphenated terms as one word and ignore standalone punctuation. No sentence exceeds 22 words. “Flag” points to a finding above; all other rows pass the plain-words checks.

### Landing page, including headings, actions, labels, and footer

| Words | Exact text | Result |
|---:|---|---|
| 2 | Field Atlas | Pass — wordmark. |
| 3 | Local timeline viewer | **F-3-10.** |
| 1 | Demo | Pass — destination link. |
| 1 | Privacy | Pass — destination link. |
| 1 | Online | Pass — connection status. |
| 3 | Open Timeline JSON | Pass — result-naming action. |
| 4 | Local Timeline JSON viewer | Pass; conflicts with the shorter header label in F-3-10. |
| 5 | Browse your exported Google Timeline | Pass — job h1. |
| 10 | For people with a Timeline JSON file they cannot open. | Pass — audience sentence. |
| 5 | Try it with sample data | Pass — result-naming primary action. |
| 9 | The sample opens the calendar, entries, map, and exports. | Pass — next-result sentence. |
| 4 | Runs in your browser | Pass as local-behavior fact; see required fact-set failure F-3-3. |
| 6 | Sample works after the first visit | **F-3-3.** |
| 5 | Export CSV, GPX, or KML | Pass — registered export claims. |
| 3 | Timeline entry types | Pass — informative label. |
| 4 | Visits and named places | Pass. |
| 3 | Trips and paths | Pass. |
| 3 | Raw location records | Pass. |
| 4 | Parsed in this browser | Pass — covered by local-only evidence. |
| 5 | See a sample timeline first | Pass — section heading. |
| 12 | The sample opens realistic visits, a walking route, and a cycling route. | **F-3-6.** |
| 6 | It never reads your saved timeline. | Registered under demo-isolation but false on a live route transition; **F-3-1.** |
| 4 | Open the sample viewer | Pass — result-naming action. |
| 3 | How it works | Pass — section heading. |
| 3 | Open a file | Pass — step heading. |
| 9 | Choose Timeline.json, Records.json, or a legacy Google Takeout file. | Pass — registered formats. |
| 2 | Browse days | Pass — step heading. |
| 12 | Find visits, trips, and raw records in the calendar and coordinate map. | Pass — registered browse result. |
| 3 | Take a copy | **F-3-7.** |
| 10 | Export a selected date range as CSV, GPX, or KML. | Pass — registered exports. |
| 6 | What Field Atlas does not do | Pass — limitation section. |
| 8 | Street tiles stay off until you choose them. | Pass — registered default behavior. |
| 7 | The sample never touches your saved timeline. | Registered under demo-isolation but false on a live route transition; **F-3-1.** |
| 9 | Read how local storage and optional map tiles work. | Pass — descriptive link. |
| 8 | Field Atlas reads Timeline JSON in your browser. | Pass — covered by local-only evidence. |
| 1 | Terms | Pass — destination link. |
| 9 | Source code on GitHub (opens in a new site) | Pass — external destination is disclosed. |
| 2 | Version 1.0.0 | Pass. |
| 4 | Built by Param Factory | Pass. |

### README

| Words | Exact text | Result |
|---:|---|---|
| 6 | Field Atlas — browse Google Timeline JSON | Pass — document title; the dash is not counted. |
| 13 | Field Atlas is for people with a Timeline JSON file they cannot open. | Pass. |
| 11 | It shows days, visits, trips, and coordinate-map details in the browser. | Pass. |
| 6 | Try the isolated sample at timeline-json-viewer.sociobot.in/?demo=1. | The direct path works; isolation fails after UI navigation in **F-3-1**. |
| 3 | What it does | Pass — section heading. |
| 8 | Opens Timeline.json, legacy Google Takeout JSON, and Records.json. | Pass — import-formats. |
| 8 | Shows visits, trips, coordinate-map text, and place search. | Pass — import-browse. |
| 10 | Exports a selected date range as CSV, GPX, or KML. | Pass — export claims. |
| 13 | Keeps the shipped sample available after refresh and offline after its first visit. | Pass — persistence and offline claims. |
| 4 | Starts street tiles off. | Pass — tiles-default-off. |
| 9 | OpenStreetMap tiles load only after you turn them on. | Pass — street-tiles. |
| 10 | Rejects Timeline JSON files larger than 200 MB before parsing. | Pass — file-size-limit. |
| 10 | Field Atlas sends no Timeline JSON data to a server. | Pass — local-only. |
| 13 | The demo uses a separate browser store and never touches a saved timeline. | False after a valid UI transition; **F-3-1.** |
| 9 | Read the in-app privacy page before opening personal data. | Pass — useful instruction. |
| 3 | Run and verify | Pass — section heading. |
| 5 | Requires Node.js 20 or newer. | Pass — developer prerequisite. |
| 9 | Run every declared product claim from a clean clone. | Pass — verification instruction. |
| 5 | npm run build creates dist/. | Pass — confirmed in the clean clone. |
| 8 | Deploy that directory to Azure Static Web Apps. | Pass — deployment instruction. |
| 12 | The service worker precaches the app shell and the shipped sample route. | **F-3-8.** |
| 3 | Privacy and limits | Pass — section heading. |
| 15 | A saved timeline stays in this browser until you remove it or clear site data. | Pass — real-local-persistence. |
| 10 | Optional tile requests send map-image GETs, not Timeline JSON data. | **F-3-9.** |
| 4 | Google changes export formats. | Pass — limitation. |
| 8 | Keep the original Timeline JSON as your backup. | Pass — useful instruction. |
| 2 | Project files | Pass — section heading. |
| 6 | .factory/claims.json lists every testable product claim. | F-3-8 identifies an exception to this statement. |
| 6 | .factory/demo.md describes the isolated sample sandbox. | The document exists; the live transition violates its boundary in F-3-1. |
| 7 | .factory/design.md records the archival field-atlas visual system. | Pass. |
| 4 | .factory/handoff.md records release verification. | Pass as a file description. |
| 5 | Licensed under the MIT License. | Pass; `LICENSE` exists. |

### Terminology

| Concept | Required term | Observed result |
|---|---|---|
| Source file | Timeline JSON | Consistent. Literal filenames use Timeline.json and Records.json. |
| Browser copy | saved timeline | Consistent. |
| Generic record | entry | Consistent. |
| Local map | coordinate map | Consistent; README uses grammatical compound-adjective hyphenation. |
| Remote map | OpenStreetMap tiles / street tiles | Consistent enough by context. |
| Product category | Local Timeline JSON viewer | Header shortens this to “Local timeline viewer”; F-3-10. |

## Demo, reset, storage, privacy, and offline checks

The normal cold path works: root → **Try it with sample data** reaches `/demo` in one click and immediately shows a five-entry `Sample Timeline JSON`, August calendar, selected day, coordinate map, search, and three exports. The demo banner and **Reset demo** / **Start for real** controls are visible at 390 px and desktop.

Reset was changed from August 18 with search `museum`; it restored August 20, cleared search, and restored five sample entries. A clean direct demo created only `demo:field-atlas-v1` and `demo:field-atlas-date`.

The live private-flow request log opened `/?demo=1`, imported `semantic.json`, searched, exported CSV, waited for the worker, switched the context offline, and reloaded. It recorded six requests, all same-origin GETs with no bodies. No URL or body contained `Museum, Hall` or `40.7128`; the timeline remained visible and the page showed Offline. There were no console or page errors. Street-tile request privacy is also covered by the passing declared test.

Those successes do not offset F-3-1: direct clean entry is only one demo entry path, and the UI navigation path crosses the real/demo boundary.

## Claims registry and clean-clone results

A clean clone at `/tmp/timeline-review3.tiVgrB/repo`, commit `9369cf53d871db563587a2750d90d9766edbc1f9`, was installed with `npm ci`. Every `test` field in `.factory/claims.json` was then executed separately and unchanged. Each ran in both configured browser projects.

| Claim ID | Declared command result | Independent qualification |
|---|---|---|
| demo-isolation | PASS — 2/2 | The claim is false after real-data or legal-page UI navigation; F-3-1. |
| offline-reload | PASS — 2/2 | Confirmed live with a request log and offline reload. |
| import-formats | PASS — 2/2 | Three fixtures opened. |
| import-browse | PASS — 2/2 | Visits, trips, map text, and search asserted. |
| csv-export | PASS — 2/2 | Header and sample row asserted. |
| gpx-export | PASS — 2/2 | Waypoint and track point asserted. |
| kml-export | PASS — 2/2 | Named point and path asserted. |
| local-only | PASS — 2/2 | Same-origin/bodyless request boundary asserted. |
| tiles-default-off | PASS — 2/2 | No default tile request. |
| street-tiles | PASS — 2/2 | Opt-in request and attribution asserted. |
| local-persistence | PASS — 2/2 | Demo reload asserted. |
| real-local-persistence | PASS — 2/2 | Real import/reload/remove asserted. |
| tile-request-privacy | PASS — 2/2 | Origin, method, body, and marker boundary asserted. |
| demo-discard | PASS — 2/2 | Clean direct-demo discard asserted; existing-real-data exit is not covered. |
| file-size-limit | PASS — 2/2 | Generated 201 MB file rejected. |

No declared command failed. The total is 30/30 cases. F-3-1 is still an untested state transition and an observed failure of the registered isolation claim.

Additional clean-clone checks:

| Check | Result |
|---|---|
| `npm run check` | PASS — 0 errors, 0 warnings |
| `npm test` | PASS — 7/7 |
| `npm run build` | PASS — `dist/` produced |
| `npm run check:bundle` | PASS — initial JS 73,869 B; CSS 17,130 B; fonts 0 B |
| `npm run test:e2e` | PASS — 42/42 |
| `npm run test:axe` | PASS — 2/2 populated-state audits |
| Live `TARGET_URL=... npm run test:axe` | PASS — 2/2 |
| `/opt/fleet/lib/verify-url.sh` | PASS — title, lang, one h1, main, alt, labels, and zero console errors |

## Structure, routes, links, and identity

| Check | Result |
|---|---|
| Titles | PASS on `/`, `/demo`, `/privacy`, `/terms`, and cold 404. |
| One h1 and heading order | PASS on all inspected routes. |
| Description / OG / Twitter / icons | PASS with one description per route; query-demo canonical fails F-3-5. |
| Cold unknown route | PASS for HTTP status and designed return action; shared chrome fails F-3-4. |
| Deep links | Direct `/demo`, `/privacy`, and `/terms` load correctly. UI transitions into Demo fail F-3-1. |
| Back / focus | Route h1 focus and announcement work. Saved workspace restoration fails F-3-2. |
| Crawl files | PASS — `robots.txt`, `sitemap.xml`, manifest, favicon, Apple icon, and social card return correct types. |
| Dead-link crawl | PASS — all discovered internal links and the GitHub source return expected success; the tested unknown URL correctly returns 404 cold. |
| Header/footer | PASS on SPA routes; static 404 fails F-3-4. |
| Security headers | PASS — CSP, frame-ancestors response header, referrer policy, nosniff, and permissions policy observed. |
| Accessibility | PASS in shipped and live populated axe runs; visible focus and reduced-motion rules are present. |
| Visual identity | PASS — warm paper, drafting-table ink, ruled ledger, cartographic marks, and rust/water/meadow semantics are recognizably product-specific, not a generic SaaS template. |

## Earlier-finding verification

Every earlier `review-*.md`, `polish-*.md`, and the prior handoff was read. Each review finding was checked against current source and live behavior. “Fixed” below means independently re-observed, not accepted from a polish note.

| Earlier ID | Current live/code confirmation | Status |
|---|---|---|
| F-1-1 | Ungated job h1, audience, and action are visible cold. | Fixed. |
| F-1-2 | Direct demo works, but UI navigation can expose the real timeline or open empty. | **Regressed — blocking; F-3-1.** |
| F-1-3 | Registry and tags exist, but demo-isolation never tests a pre-existing real store or legal-page entry. | **Half-fixed — blocking; F-3-1.** |
| F-1-4 | A cold unknown request returns the designed HTTP 404. | Fixed. |
| F-1-5 | Wordmark is not h1; each page has one job/page h1. | Fixed. |
| F-1-6 | Required metadata exists on named routes. Query-demo canonical is a new gap. | Fixed for earlier scope; F-3-5. |
| F-1-7 | Route changes and Back focus/announce the h1. Saved-state restoration is a separate regression. | Fixed for focus; F-3-2. |
| F-1-8 | Real text/XML crawl files return correct types. | Fixed. |
| F-1-9 | Preview, steps, privacy, nav, and footer exist, but the required price/offline fact shape is incomplete. | **Half-fixed — blocking; F-3-3.** |
| F-1-10 | KML export and exact tagged test exist. | Fixed. |
| F-1-11 | Clean full browser suite passed 42/42. | Fixed. |
| F-1-12 | Offline sample claim is registered and passes. | Fixed; wording issue in F-3-3. |
| F-1-13 | Three format fixtures pass. | Fixed. |
| F-1-14 | Local-only request logging passes. | Fixed. |
| F-1-15 | 201 MB rejection passes. | Fixed. |
| F-1-16 | Broad no-account claim remains absent. | Fixed. |
| F-1-17 | Demo offline behavior passes. | Fixed. |
| F-1-18 | CSV, GPX, and KML contents are asserted. | Fixed. |
| F-1-19 | The old movement slogan is absent. | Fixed. |
| F-1-20 | The old architecture inventory is absent. | Fixed. |
| F-1-21 | Real import persists, reloads, and removes in its tagged test. | Fixed. |
| F-1-22 | Default coordinate map makes no tile request. | Fixed. |
| F-1-23 | Tile request origin/body/source-data boundaries pass. | Fixed. |
| F-1-24 | Sample browse output and search pass. | Fixed. |
| F-1-25 | “Maintained” claim remains absent. | Fixed. |
| F-1-26 | Formats and size are split and tested. | Fixed. |
| F-1-27 | Unmeasured responsiveness promise remains absent. | Fixed. |
| F-1-28 | Calendar, itinerary, coordinate map text, and search are exercised. | Fixed. |
| F-1-29 | Opt-in tiles and attribution pass. | Fixed. |
| F-1-30 | Tiles are off in a fresh context. | Fixed. |
| F-1-31 | Range exports have exact content checks. | Fixed. |
| F-1-32 | Demo persistence and offline reload are separate passing claims. | Fixed. |
| F-1-33 | Import/search/export request log stays within the allowed boundary. | Fixed. |
| F-1-34 | Untestable infrastructure inventory remains absent. | Fixed. |
| F-1-35 | All three fixture families import. | Fixed. |
| F-1-36 | Parser warning behavior remains unit-tested; broad coverage promise is absent. | Fixed. |
| F-1-37 | Worker/responsiveness marketing promise remains absent. | Fixed. |
| F-1-38 | Size rejection is registered. | Fixed. |
| F-1-39 | Untested date-offset promise remains absent. | Fixed. |
| F-1-40 | First-screen format copy has no schema jargon. | Fixed. |
| F-1-41 | “Recovery desk” metaphor remains absent. | Fixed. |
| F-1-42 | Footer is factual. | Fixed. |
| F-1-43 | Fake coordinates remain absent. | Fixed. |
| F-1-44 | File action consistently says “Open Timeline JSON.” | Fixed. |
| F-1-45 | Vague modal action remains absent. | Fixed. |
| F-1-46 | Timeline JSON / saved timeline terms are consistent. | Fixed. |
| F-1-47 | Privacy h1 is descriptive. | Fixed. |
| F-1-48 | README audience copy is 13 words. | Fixed. |
| F-1-49 | Schema/worker jargon is absent from format copy. | Fixed. |
| F-1-50 | Entries and coordinate-map wording replaced ledger/plot jargon. | Fixed. |
| F-1-51 | README tile wording is plain except the new GET jargon in F-3-9. | Fixed for earlier “lazy-loads” issue. |
| F-1-52 | Compound persistence/offline promise was split and tested. | Fixed. |
| F-1-53 | CDN-stack inventory remains absent. | Fixed. |
| F-1-54 | README format description is plain. | Fixed. |
| F-1-55 | JSON.parse/main-thread paragraph remains absent. | Fixed. |
| F-1-56 | Verification instructions are concise. | Fixed. |
| F-1-57 | Service-worker absence is caught; browser test passes. | Fixed. |
| F-1-58 | GitHub link names the destination and announces another site. | Fixed. |
| F-1-59 | Skip link says “Skip to main content.” | Fixed. |
| F-2-1 | Direct-demo Start for real clears the demo store/key in its tagged test. Existing-real-data exit needs coverage under F-3-1/F-3-2. | Fixed for exact claim. |
| F-2-2 | Exactly one route-specific description exists. | Fixed. |
| F-2-3 | Static 404 metadata is complete. Shared site chrome is a new issue, F-3-4. | Fixed for metadata. |

The older verifier defects recorded outside the review IDs were also checked: the calendar uses a labelled button group with arrow navigation, Leaflet assets load with attribution, the file input is captured before `await`, the online check handles cached offline reload, and worker reload is gated by explicit update activation. The corresponding clean and live tests pass.

## Missed leverage

No AI feature is justified. Summarising or classifying private movement history through a gateway would add network disclosure without helping the core job of faithful browsing and export. Sync would contradict the local-only brief. The brief-implied imports and CSV/GPX/KML exports are present. No additional leverage finding is raised.

## What would make this perfect

Fix route initialization so demo and real scopes are selected from the destination route, then prove isolation with a pre-existing real timeline and every UI entry path. Restore a populated workspace through Back and Start for real. Replace the first-screen facts with explicit privacy, offline, and free statements. Complete the static 404 chrome, correct the query-demo canonical, and make the five flagged copy edits. Re-run every claim plus the new transition cases on mobile and desktop. At that point there should be no remaining finding, including no sentence in this report that still needs a qualifier.
