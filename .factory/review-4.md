# Adversarial first-read review 4 — Field Atlas

**Verdict: PASS**

Date: 2026-08-29 UTC
Work order: `timeline-json-viewer-review-4`
Reviewed clean commit: `4bcd6639370230b6f4a07ff0f7663e42d6820267`
Live URL: <https://timeline-json-viewer.sociobot.in>

This is a complete repeat of the review, not a diff-only check. The clean clone and the live deployment passed the first-read, demo, claim, privacy, route, accessibility, copy, mobile, and prior-finding checks. No finding remains.

## Cold first read

Fresh Chromium contexts with no carried browser storage were opened at 390 × 844 and 1440 × 900. No scrolling occurred before these answers were recorded.

| Question | Answer available on the first screen |
|---|---|
| What does this do? | “Browse your exported Google Timeline.” It offers a Timeline JSON viewer, calendar, map, and exports. |
| For whom? | “For people with a Timeline JSON file they cannot open.” |
| What should I click first? | “Try it with sample data.” The adjacent sentence states that it opens the calendar, map, and CSV, GPX, or KML exports. |

The 390 px screen also shows the three required facts before the fold: “No Timeline JSON upload,” “Sample works offline after your first visit,” and “Free to use.” The real-data action is consistently named “Open Timeline JSON.” The first read is clear without a privacy gate.

## Copy audit

Word counts treat literal filenames, URLs, hyphenated terms, and command names as one word. Every visitor-facing sentence, heading, fact, and action on the landing page and every sentence in `README.md` is listed below. No item exceeds 22 words. No banned marketing adjective, empty slogan, unexplained metaphor, inconsistent product term, or non-result-naming button was found.

### Landing page

| Words | Exact copy | Check |
|---:|---|---|
| 2 | Field Atlas | Product name; wordmark, not a heading. |
| 4 | Local Timeline JSON viewer | Clear category label. |
| 5 | Browse your exported Google Timeline | Clear job h1. |
| 10 | For people with a Timeline JSON file they cannot open. | Names the user and situation. |
| 5 | Try it with sample data | Result-naming demo action. |
| 3 | Open Timeline JSON | Result-naming real-data action. |
| 12 | The sample opens the calendar, map, and CSV, GPX, or KML exports. | States the result of the primary action. |
| 4 | No Timeline JSON upload | `local-only`. |
| 7 | Sample works offline after your first visit | `offline-reload`. |
| 3 | Free to use | `free-to-use`. |
| 3 | Timeline entry types | Clear legend heading. |
| 4 | Visits and named places | Clear type label. |
| 3 | Trips and paths | Clear type label. |
| 3 | Raw location records | Clear type label. |
| 4 | Parsed in this browser | Supports the local-processing explanation; no separate outcome promise. |
| 6 | See a sample timeline first | Clear section heading. |
| 12 | The sample includes three visits, a walking route, and a cycling route. | `import-browse`. |
| 6 | It never reads your saved timeline. | `demo-isolation`. |
| 4 | Open the sample viewer | Result-naming demo action. |
| 3 | How it works | Clear section heading. |
| 3 | Open a file | Clear step heading. |
| 9 | Choose Timeline.json, Records.json, or a legacy Google Takeout file. | `import-formats`. |
| 2 | Browse days | Clear step heading. |
| 12 | Find visits, trips, and raw records in the calendar and coordinate map. | `import-browse`. |
| 4 | Export a date range | Clear step heading. |
| 10 | Export a selected date range as CSV, GPX, or KML. | `csv-export`, `gpx-export`, and `kml-export`. |
| 6 | What Field Atlas does not do | Clear limits heading. |
| 8 | Street tiles stay off until you choose them. | `tiles-default-off`. |
| 7 | The sample never touches your saved timeline. | `demo-isolation`. |
| 9 | Read how local storage and optional map tiles work. | Clear destination link. |
| 8 | Field Atlas reads Timeline JSON in your browser. | Consistent factual footer line. |
| 4 | Source code on GitHub | Identifies the external destination. |
| 4 | opens in a new site | Screen-reader disclosure for that external link. |
| 3 | Version 1.0.0 | Build identifier. |
| 4 | Built by Param Factory | Factory credit. |

The dynamic demo/workspace labels are also plain and result-specific: “Demo — sample data, nothing is saved,” “Reset demo,” “Start for real,” “Search places and activities,” and “Export a date range.” The import error names the problem, gives the limit, and tells the visitor to split the file by year.

### README

| Words | Exact copy | Check |
|---:|---|---|
| 6 | Field Atlas — browse Google Timeline JSON | Clear document title. |
| 13 | Field Atlas is for people with a Timeline JSON file they cannot open. | Clear audience. |
| 11 | It shows days, visits, trips, and coordinate-map details in the browser. | `import-browse`. |
| 6 | Try the isolated sample at timeline-json-viewer.sociobot.in/?demo=1. | `demo-isolation`; direct route works. |
| 3 | What it does | Clear section heading. |
| 8 | Opens Timeline.json, legacy Google Takeout JSON, and Records.json. | `import-formats`. |
| 8 | Shows visits, trips, coordinate-map text, and place search. | `import-browse`. |
| 10 | Exports a selected date range as CSV, GPX, or KML. | Export claims. |
| 13 | Keeps the shipped sample available after refresh and offline after its first visit. | `local-persistence` and `offline-reload`. |
| 4 | Starts street tiles off. | `tiles-default-off`. |
| 9 | OpenStreetMap tiles load only after you turn them on. | `street-tiles`. |
| 10 | Rejects Timeline JSON files larger than 200 MB before parsing. | `file-size-limit`. |
| 10 | Field Atlas sends no Timeline JSON data to a server. | `local-only`. |
| 13 | The demo uses a separate browser store and never touches a saved timeline. | `demo-isolation`. |
| 9 | Read the in-app privacy page before opening personal data. | Clear instruction. |
| 3 | Run and verify | Clear section heading. |
| 5 | Requires Node.js 20 or newer. | Development prerequisite. |
| 9 | Run every declared product claim from a clean clone. | Verification instruction. |
| 5 | npm run build creates dist/. | Verified build outcome. |
| 8 | Deploy that directory to Azure Static Web Apps. | Deployment instruction. |
| 3 | Privacy and limits | Clear section heading. |
| 15 | A saved timeline stays in this browser until you remove it or clear site data. | `real-local-persistence`. |
| 6 | Optional tile requests fetch map images. | `tile-request-privacy`. |
| 6 | They never include Timeline JSON data. | `tile-request-privacy`. |
| 4 | Google changes export formats. | Plain limitation, not a product capability claim. |
| 8 | Keep the original Timeline JSON as your backup. | Useful advice. |
| 2 | Project files | Clear section heading. |
| 6 | .factory/claims.json lists every testable product claim. | Repository fact; checked. |
| 6 | .factory/demo.md describes the isolated sample sandbox. | Repository fact; checked. |
| 7 | .factory/design.md records the archival field-atlas visual system. | Repository fact; checked. |
| 6 | .factory/handoff.md records release verification. | Repository fact; checked. |
| 5 | Licensed under the MIT License. | Legal statement. |

No claim-like landing or README sentence is missing a corresponding claim entry. The three non-product statements above—Google format volatility, backup advice, and repository documentation—do not assert an observable product outcome.

## Demo, sandbox, and privacy verification

One click on **Try it with sample data** navigated to `/demo` and immediately displayed a populated August 2026 calendar, selected-day entries, a coordinate map, place search, and CSV/GPX/KML export controls. The sample contains exactly three visits, a walking trip, and a cycling trip. The persistent banner reads “Demo — sample data, nothing is saved” and exposes **Reset demo** and **Start for real**.

- **Reset demo** restored the sample and cleared changed selection/search state.
- Direct `/demo`, documented `/?demo=1`, header Demo, footer Demo, and Demo links reached the isolated sample. The query route sets canonical `/demo`.
- `@claim:demo-isolation` starts with a real imported fixture, enters Demo from the header and each legal page, checks both IndexedDB scopes, resets the demo, and exits. It passed in desktop and mobile.
- `@claim:demo-discard` confirms that **Start for real** removes the `demo:field-atlas-v1` record and `demo:field-atlas-date` key without creating a real record in a clean context. The isolation test also confirms it restores existing real data unchanged.
- The direct demo request log contained only bodyless same-origin `GET` requests for the app, connection check, and local icon. The declared `local-only` test additionally imported a fixture, searched, and exported while recording requests; it passed in both projects.
- `@claim:offline-reload` loaded demo data, obtained the service worker, disabled networking, reloaded, and verified sample entries, search, and the Offline status. It passed in both projects.

No CLI or library sandbox applies to this PWA. The product contains no AI feature, provider key, sync, or upload path. The brief’s useful imports and CSV/GPX/KML exports are present; an AI or sync addition would add an unnecessary privacy boundary.

## Claims and clean-clone verification

Clean clone: `/tmp/timeline-review4.jwXHVT/repo`, cloned from `main` at `4bcd6639370230b6f4a07ff0f7663e42d6820267`. `npm ci` installed 91 packages with zero vulnerabilities. Every `test` command from `.factory/claims.json` was executed separately and unchanged. Each command passed in both desktop and mobile projects: **16 commands, 32/32 cases**.

| Claim ID | Result | Observable evidence |
|---|---|---|
| `demo-isolation` | PASS | Real/demo IndexedDB scopes remain separate through every entry path. |
| `offline-reload` | PASS | Seeded sample, search, and Offline status survive reload without network. |
| `import-formats` | PASS | Timeline, legacy Takeout, and Records fixtures render. |
| `import-browse` | PASS | Three visits, walking/cycling trips, text itinerary, and search render. |
| `csv-export` | PASS | Download contains required header and sample row. |
| `gpx-export` | PASS | Download contains waypoint and track point. |
| `kml-export` | PASS | Download contains named point and path. |
| `local-only` | PASS | Import/search/export requests are bodyless same-origin GETs. |
| `tiles-default-off` | PASS | Fresh coordinate map makes no tile request. |
| `street-tiles` | PASS | Opt-in loads OpenStreetMap tiles and attribution. |
| `local-persistence` | PASS | Demo survives refresh in its separate scope. |
| `real-local-persistence` | PASS | Real import survives refresh and is removed on command. |
| `tile-request-privacy` | PASS | Tile requests are GETs without bodies or fixture marker/coordinate data. |
| `demo-discard` | PASS | Exit deletes demo data and date state before the real importer. |
| `file-size-limit` | PASS | Generated 201 MB JSON is rejected before parsing. |
| `free-to-use` | PASS | Landing fact is present; no payment, billing, purchase, or upgrade route exists. |

Additional clean-clone gates passed:

| Command | Result |
|---|---|
| `npm run check` | PASS — 0 errors, 0 warnings. |
| `npm test` | PASS — 7/7. |
| `npm run build` | PASS — `dist/` produced. |
| `npm run check:bundle` | PASS — initial JS 74,603 B, CSS 17,130 B, fonts 0 B. |

The live deployment also passed `TARGET_URL=https://timeline-json-viewer.sociobot.in npm run test:e2e`: **50/50**. Its dedicated live axe run passed **4/4** public-route audits.

## Structure, routes, and accessibility

| Check | Result |
|---|---|
| Title pattern | PASS — root is `Field Atlas — Browse Google Timeline JSON`; Demo, Privacy, Terms, and 404 have route-correct titles. |
| Metadata | PASS — one route-specific description, canonical, OG/Twitter card, social image, SVG favicon, Apple touch icon, language, and matching theme color. |
| Semantic page structure | PASS — one h1 and one main landmark on `/`, `/demo`, `/privacy`, `/terms`, and static 404. |
| 404 | PASS — unknown live URL returned HTTP 404 with the designed Field Atlas page, skip link, header, footer, legal links, factory credit, and return action. |
| Routing | PASS — deep links load; History Back/Forward restores the saved workspace; route changes focus the h1 and announce it. |
| Crawl | PASS — all discovered internal resources, crawl files, icons, social card, and the explicitly marked GitHub link returned the expected response. |
| Header/footer | PASS — shared wordmark/home, Demo/Privacy navigation, skip link, Privacy/Terms, version, and factory credit appear on public routes and static 404. |
| Keyboard/mobile/motion | PASS — keyboard demo controls work; visible focus, arrow-day navigation, 390 px layout, 200% text, and reduced motion checks pass. |
| Axe | PASS — live `npm run test:axe` found no serious or critical WCAG 2 A/AA issue on all five public pages. |
| Privacy/security | PASS — request logs show no Timeline JSON upload; tiles are opt-in; live headers include CSP with response-header `frame-ancestors`, `no-referrer`, `nosniff`, and the expected permissions policy. |
| Visual identity | PASS — the warm-paper atlas, drafting-table surround, ruled ledger, hand-authored map mark, and rust/water/meadow route language follow `.factory/design.md` and are not a generic SaaS template. |

## Earlier-finding verification

All earlier reviews, polish maps, verification records, and the previous handoff were read. Each item below was rechecked in current source and on the live site; none is accepted solely because an earlier document marked it fixed.

| Earlier finding | Current confirmation | Status |
|---|---|---|
| F-1-1 | Ungated cold h1, audience, and two first actions are visible at 390 px and desktop. | Fixed |
| F-1-2 | Every Demo entry is isolated, populated, bannered, resettable, and discardable. | Fixed |
| F-1-3 | 16 registered claims have one tagged observable test each. | Fixed |
| F-1-4 | Unknown live route is an HTTP 404 with a return action. | Fixed |
| F-1-5 | Wordmark is not a heading; each public page has one contextual h1. | Fixed |
| F-1-6 | Per-route canonical, description, social metadata, and icons exist. | Fixed |
| F-1-7 | Navigation and Back focus/announce the h1. | Fixed |
| F-1-8 | `robots.txt` and `sitemap.xml` are correctly typed static files. | Fixed |
| F-1-9 | Landing has demo preview, three steps, limit/privacy section, navigation, and full footer. | Fixed |
| F-1-10 | Selected-range KML export has an exact download claim test. | Fixed |
| F-1-11 | Live serial browser suite passed 50/50. | Fixed |
| F-1-12 | Offline sample fact has `offline-reload`. | Fixed |
| F-1-13 | Three import formats have `import-formats`. | Fixed |
| F-1-14 | Local-only flow has request-log evidence. | Fixed |
| F-1-15 | 201 MB rejection is asserted. | Fixed |
| F-1-16 | Broad no-account statement remains absent. | Fixed |
| F-1-17 | Offline wording is specific to the seeded sample and tested. | Fixed |
| F-1-18 | CSV, GPX, and KML downloads are inspected. | Fixed |
| F-1-19 | Privacy-gate slogan and gate are absent. | Fixed |
| F-1-20 | Unprovable architecture inventory is absent. | Fixed |
| F-1-21 | Real scope import, reload, and removal pass `real-local-persistence`. | Fixed |
| F-1-22 | Coordinate map has tiles off by default and no initial tile request. | Fixed |
| F-1-23 | Tile origin, method, body, and source-data boundaries pass request-log testing. | Fixed |
| F-1-24 | Sample calendar, entries, text map, routes, and search are asserted. | Fixed |
| F-1-25 | Unsupported “maintained” claim is absent. | Fixed |
| F-1-26 | Formats and size are separate, tested claims. | Fixed |
| F-1-27 | Unmeasured responsiveness claim is absent. | Fixed |
| F-1-28 | Browse output has an observable demo test. | Fixed |
| F-1-29 | Street-tile opt-in and attribution are tested. | Fixed |
| F-1-30 | Fresh tile default is tested. | Fixed |
| F-1-31 | Date-range export contents are tested. | Fixed |
| F-1-32 | Demo persistence and offline reload are separate claims. | Fixed |
| F-1-33 | Import/search/export request log is asserted. | Fixed |
| F-1-34 | Untestable stack marketing is absent. | Fixed |
| F-1-35 | Three fixture families are tested. | Fixed |
| F-1-36 | Unsupported-input copy is limited; parser behavior remains unit-tested. | Fixed |
| F-1-37 | Worker/responsiveness marketing is absent. | Fixed |
| F-1-38 | File-size boundary is registered. | Fixed |
| F-1-39 | Untested date-offset guarantee is absent. | Fixed |
| F-1-40 | First-screen format copy has no schema jargon. | Fixed |
| F-1-41 | Recovery metaphor is absent. | Fixed |
| F-1-42 | Footer is factual. | Fixed |
| F-1-43 | Decorative invented coordinates are absent. | Fixed |
| F-1-44 | Header and hero use “Open Timeline JSON.” | Fixed |
| F-1-45 | Vague privacy-gate action is absent. | Fixed |
| F-1-46 | Timeline JSON, saved timeline, entry, and coordinate map terms are consistent. | Fixed |
| F-1-47 | Privacy h1 names the section. | Fixed |
| F-1-48 | README audience sentence is within the word cap. | Fixed |
| F-1-49 | Schema/worker jargon is absent from reader copy. | Fixed |
| F-1-50 | README uses entries and coordinate map. | Fixed |
| F-1-51 | Tile wording is plain and opt-in. | Fixed |
| F-1-52 | Storage/offline promises are split and tested. | Fixed |
| F-1-53 | CDN-stack jargon is absent. | Fixed |
| F-1-54 | README format description is plain. | Fixed |
| F-1-55 | Parser/main-thread prose is absent. | Fixed |
| F-1-56 | Verification instructions are concise and executable. | Fixed |
| F-1-57 | Service-worker absence is handled without an error. | Fixed |
| F-1-58 | GitHub source link identifies its external destination. | Fixed |
| F-1-59 | Every skip link says “Skip to main content.” | Fixed |
| F-2-1 | Direct exit removes demo state; exit with saved real data restores it unchanged. | Fixed |
| F-2-2 | Each SPA route has exactly one route-specific description. | Fixed |
| F-2-3 | Static 404 has complete noindex/social/icon metadata. | Fixed |
| F-3-1 | Real data cannot appear in Demo; legal-page Demo links seed the sample. | Fixed |
| F-3-2 | Back/Forward and demo exit restore the populated real workspace. | Fixed |
| F-3-3 | First screen explicitly states upload boundary, offline behavior, and free price. | Fixed |
| F-3-4 | Static 404 has shared header, skip link, footer, legal links, version, and credit. | Fixed |
| F-3-5 | `?demo=1` canonicalizes to `/demo`. | Fixed |
| F-3-6 | Unsupported “realistic” adjective is absent. | Fixed |
| F-3-7 | Export section is named “Export a date range.” | Fixed |
| F-3-8 | README service-worker implementation claim is absent. | Fixed |
| F-3-9 | Privacy copy says “map images,” not protocol jargon. | Fixed |
| F-3-10 | Header and hero use the same product category label. | Fixed |

## What would make this perfect

No additional in-scope feature or copy change is required. Keep the declared claim suite and the transition coverage as release gates when Google changes export formats or the PWA stack changes.
