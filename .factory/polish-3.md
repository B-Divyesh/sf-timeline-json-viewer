# Polish 3 finding map

Candidate: `9369cf53d871db563587a2750d90d9766edbc1f9`

Review report: `940b56a0928ec1b0ec9bc728b2b838e9933f293a`

Deployed implementation: `0ba8555c051d7071a32d33a132d1e54b7cb7be15`

All checks below passed in the final clean clone and on <https://timeline-json-viewer.sociobot.in>. Screenshot evidence is in `/tmp/field-atlas-polish-3-live/`: `root/screenshot-mobile.png`, `demo-cold-mobile.png`, `demo-after-real.png`, and `404-cold-mobile.png`.

## Review 1

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Kept the ungated job h1, audience, and first actions. | `first screen names the job…`; live root screenshot. |
| F-1-2 | Made direct and UI Demo entry use only the demo scope; kept banner, Reset, and exit. | `@claim:demo-isolation`; live transition replay and demo screenshots. |
| F-1-3 | Expanded the registry to 16 one-tag claims and strengthened isolation coverage. | Every claim command passed separately, 32/32. |
| F-1-4 | Kept the real HTTP 404 and completed its product chrome. | `the static 404 includes complete metadata and shared site structure`; live HTTP 404. |
| F-1-5 | Kept the wordmark outside headings and one job/page h1 per route. | `every public route is axe-clean…`. |
| F-1-6 | Kept route titles, descriptions, canonical, OG/Twitter data, and icons; corrected query-demo canonical. | `ships crawl files and route metadata`. |
| F-1-7 | Kept History routing, h1 focus, and polite announcements; restored populated Back state. | `browser history and leaving demo restore the same saved workspace`. |
| F-1-8 | Kept real robots and sitemap resources. | `ships crawl files and route metadata`. |
| F-1-9 | Kept preview, three steps, privacy limits, navigation, and complete footer; corrected the three facts. | first-screen tests; live root screenshot. |
| F-1-10 | Kept selected-range KML export. | `@claim:kml-export`. |
| F-1-11 | Removed redundant worker registrations from unrelated tests and deferred registration until load. | Two consecutive live `test:e2e` runs passed 50/50. |
| F-1-12 | Uses an explicit offline sample fact. | `@claim:offline-reload`. |
| F-1-13 | Keeps plain three-format import copy. | `@claim:import-formats`. |
| F-1-14 | Uses a precise no-Timeline-JSON-upload statement. | `@claim:local-only`. |
| F-1-15 | Keeps the 200 MB boundary with pre-parse rejection. | `@claim:file-size-limit`. |
| F-1-16 | Keeps the broad no-account assertion removed. | Copy audit; `@claim:local-only`. |
| F-1-17 | Names offline behavior directly. | `@claim:offline-reload`. |
| F-1-18 | Keeps exact CSV, GPX, and KML downloads. | `@claim:csv-export`, `gpx-export`, `kml-export`. |
| F-1-19 | Keeps the old movement slogan and modal absent. | `@claim:local-only`; cold root screenshot. |
| F-1-20 | Keeps the unprovable architecture inventory absent. | Copy audit and request-log claim. |
| F-1-21 | Proves real import, reload, persistence, and removal. | `@claim:real-local-persistence`. |
| F-1-22 | Keeps the coordinate map tile-free by default. | `@claim:tiles-default-off`. |
| F-1-23 | Proves tile origin, method, empty body, and private-data boundaries. | `@claim:tile-request-privacy`. |
| F-1-24 | Keeps visible visits, trips, map text, and search. | `@claim:import-browse`. |
| F-1-25 | Keeps “maintained” removed. | `.factory/copy-audit.md`. |
| F-1-26 | Keeps format and size promises split and tested. | `@claim:import-formats`; `@claim:file-size-limit`. |
| F-1-27 | Keeps the unmeasured responsiveness promise removed. | Copy audit. |
| F-1-28 | Proves calendar entries, map text, and search in the sample. | `@claim:import-browse`. |
| F-1-29 | Keeps opt-in OpenStreetMap loading and visible credit. | `@claim:street-tiles`. |
| F-1-30 | Proves street tiles start off. | `@claim:tiles-default-off`. |
| F-1-31 | Proves exact selected-range export contents. | Three export claim tests. |
| F-1-32 | Separates persistence and offline outcomes. | `@claim:local-persistence`; `@claim:offline-reload`. |
| F-1-33 | Proves import, search, map, and export data stay out of requests. | `@claim:local-only`. |
| F-1-34 | Keeps untestable infrastructure marketing absent. | Copy audit, CSP check, request-log claim. |
| F-1-35 | Imports all three fixture families. | `@claim:import-formats`. |
| F-1-36 | Keeps unsupported/malformed behavior explicit and tested. | `reports malformed and unsupported input clearly`. |
| F-1-37 | Keeps worker responsiveness marketing absent. | Copy audit. |
| F-1-38 | Registers and tests the size rejection. | `@claim:file-size-limit`. |
| F-1-39 | Keeps the broad offset promise absent; parser behavior remains unit-tested. | `uses the source offset date at timezone boundaries`. |
| F-1-40 | Keeps schema jargon off the first screen. | Copy audit; live root screenshot. |
| F-1-41 | Keeps the “recovery desk” metaphor absent. | Copy audit. |
| F-1-42 | Keeps the factual footer sentence. | Static-404/shared-footer test; live screenshots. |
| F-1-43 | Keeps invented coordinates absent. | Live root screenshot. |
| F-1-44 | Keeps `Open Timeline JSON` consistent. | first-screen test and screenshots. |
| F-1-45 | Keeps the privacy gate and vague action absent. | cold root check. |
| F-1-46 | Keeps Timeline JSON, saved timeline, entry, and coordinate map terms consistent. | `.factory/copy-audit.md`. |
| F-1-47 | Keeps the descriptive Privacy h1. | route focus test. |
| F-1-48 | Keeps the README audience copy short and concrete. | `.factory/copy-audit.md`. |
| F-1-49 | Keeps schema/worker jargon out of README copy. | `.factory/copy-audit.md`. |
| F-1-50 | Keeps entries and coordinate map in place of ledger/plot marketing. | `@claim:import-browse`. |
| F-1-51 | Uses plain opt-in tile wording. | `@claim:street-tiles`; copy audit. |
| F-1-52 | Keeps storage and offline statements short, separate, and tested. | persistence and offline claims. |
| F-1-53 | Keeps CDN-stack jargon absent. | Copy audit and README review. |
| F-1-54 | Keeps README format language plain. | `@claim:import-formats`. |
| F-1-55 | Keeps JSON parser/main-thread prose absent. | Copy audit. |
| F-1-56 | Keeps verification instructions short and executable. | Commands in README passed in the clean clone. |
| F-1-57 | Handles unavailable service workers without an app or console error. | `viewer still works when service workers are unavailable`. |
| F-1-58 | Names GitHub and announces the external destination. | all-route axe audit and footer checks. |
| F-1-59 | Uses `Skip to main content` on every route. | all-route axe audit; static 404 structure test. |

## Review 2

| Finding | Change made | Evidence |
|---|---|---|
| F-1-21 recurrence | Real-scope persistence remains registered and tested. | `@claim:real-local-persistence`, 2/2 clean. |
| F-1-23 recurrence | Tile privacy remains a separate request-log claim. | `@claim:tile-request-privacy`, 2/2 clean. |
| F-2-1 | Demo exit deletes its record/date and does not create real data; existing real data is restored unchanged. | `@claim:demo-discard`; strengthened `@claim:demo-isolation`. |
| F-2-2 | Each SPA route still owns exactly one correct description. | `ships crawl files and route metadata`. |
| F-2-3 | The static 404 retains complete metadata and now shares the full site chrome. | static 404 test; cold live 404 screenshot. |

## Review 3

| Finding | Change made | Evidence |
|---|---|---|
| F-3-1 | Route initialization now receives the destination path/query and storage scope synchronously. Isolation tests seed real data, enter Demo from real/Privacy/Terms, reset, exit, and compare both stores. | `@claim:demo-isolation`, 2/2 clean and live; `/tmp/field-atlas-polish-3-live/demo-after-real.png`. |
| F-3-2 | Back/Forward and Start for real reload the destination’s saved state before focus moves. | `browser history and leaving demo restore the same saved workspace`, 2/2 clean and live replay. |
| F-3-3 | First-screen facts now say `No Timeline JSON upload`, `Sample works offline after your first visit`, and `Free to use`. | first-screen tests, `@claim:local-only`, `offline-reload`, `free-to-use`; root mobile screenshot. |
| F-3-4 | Static 404 now has skip link, Field Atlas header/nav, styled atlas detail, footer, legal links, version, and factory credit. | static 404 structure test; live 404 returned 404; 404 screenshot. |
| F-3-5 | Both `/demo` and `/?demo=1` canonicalize to `/demo`. | route metadata test; cold live canonical check. |
| F-3-6 | Replaced “realistic” with the exact three-visit, walking, and cycling sample contents. | `@claim:import-browse` inspects exact sample types. |
| F-3-7 | Replaced “Take a copy” with `Export a date range`; workspace eyebrow now says `Timeline export`. | Copy audit; live root/demo screenshots. |
| F-3-8 | Deleted the README service-worker/app-shell implementation claim. | README review and `.factory/copy-audit.md`. |
| F-3-9 | Rewrote privacy copy as “Optional tile requests fetch map images. They never include Timeline JSON data.” | `@claim:tile-request-privacy`; Privacy route live check. |
| F-3-10 | Header and hero both use `Local Timeline JSON viewer`; manifest uses the same category. | first-screen test; live root screenshot. |

## Final release evidence

- Final clean clone: `/tmp/timeline-polish3-final.VRQeY4/repo`.
- Claims: 16 separate commands, 32/32 desktop/mobile cases.
- Full clean browser suite: 50/50; axe: 4/4; unit: 7/7.
- Two consecutive final live browser suites: 50/50 and 50/50; live axe: 4/4.
- Live Lighthouse: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.1 s; CLS 0.009; TBT 100 ms.
- Deployment ID: `3d8501af-5c33-49f6-bc3d-385a00561dca`.

No finding is deferred.
