# Polish 2 finding map

Base reviewed: `a1ebd79fda6d47f6074bbeb87d603d28f8bf0009`.

This round rechecked every finding in `review-1.md` and `review-2.md`. Evidence is the permanent test named below; live evidence and final command output are recorded in `handoff.md` after deployment.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Kept the ungated job-first h1, audience sentence, and sample action. | `first screen names the job and opens the sample in one click` |
| F-1-2 | Kept direct `/demo` and `?demo=1`, isolated demo store, banner, reset, and exit. | `@claim:demo-isolation`, `@claim:demo-discard` |
| F-1-3 | Expanded the claim registry to 15 one-tag tests. | every `.factory/claims.json` command |
| F-1-4 | Kept static 404 override and Field Atlas return page. | route test; cold live check |
| F-1-5 | Kept page-specific h1s and non-heading wordmark. | route and axe tests |
| F-1-6 | Made route descriptions single-source and completed static-404 social/icon metadata. | `ships crawl files and route metadata`; `the static 404 includes complete noindex metadata` |
| F-1-7 | Kept History navigation, focused h1, and polite route announcement. | `routes set titles, focus headings, and render a designed unknown route` |
| F-1-8 | Kept real `robots.txt` and `sitemap.xml`. | `ships crawl files and route metadata` |
| F-1-9 | Kept Demo navigation, sample preview, steps, privacy section, and complete footer. | first-screen and route tests |
| F-1-10 | Kept date-range KML export. | `@claim:kml-export` |
| F-1-11 | Kept pinned Playwright and serial end-to-end suite. | `npm run test:e2e` |
| F-1-12 | Kept the bounded sample-offline statement. | `@claim:offline-reload` |
| F-1-13 | Kept plain three-format import copy. | `@claim:import-formats` |
| F-1-14 | Kept precise local-only copy and request log. | `@claim:local-only` |
| F-1-15 | Kept the tested 200 MB limit. | `@claim:file-size-limit` |
| F-1-16 | Kept untestable account assertion removed. | copy audit and `@claim:local-only` |
| F-1-17 | Kept demo-specific offline copy. | `@claim:offline-reload` |
| F-1-18 | Kept exact CSV, GPX, and KML export checks. | `@claim:csv-export`, `@claim:gpx-export`, `@claim:kml-export` |
| F-1-19 | Kept broad modal privacy slogan removed. | copy audit |
| F-1-20 | Kept architecture inventory removed from visitor copy. | copy audit |
| F-1-21 | Added real-scope persistence test and avoided empty real-store creation on read. | `@claim:real-local-persistence` |
| F-1-22 | Kept private coordinate map and default-off tile test. | `@claim:tiles-default-off` |
| F-1-23 | Added tile request allowlist/body/source-data privacy test; rewrote disclosure to its observable boundary. | `@claim:tile-request-privacy` |
| F-1-24 | Kept visits, trips, itinerary, and search demo flow. | `@claim:import-browse` |
| F-1-25 | Kept unsupported “maintained” promise removed. | copy audit |
| F-1-26 | Kept format and size claims split. | `@claim:import-formats`, `@claim:file-size-limit` |
| F-1-27 | Kept unmeasured responsiveness claim removed. | copy audit |
| F-1-28 | Kept observable browse workflow. | `@claim:import-browse` |
| F-1-29 | Kept opt-in tiles and attribution. | `@claim:street-tiles` |
| F-1-30 | Kept tested default-off tiles. | `@claim:tiles-default-off` |
| F-1-31 | Kept exact export-content coverage. | export claim tests |
| F-1-32 | Kept separate demo persistence and offline claims. | `@claim:local-persistence`, `@claim:offline-reload` |
| F-1-33 | Kept demo import/search/export request log. | `@claim:local-only` |
| F-1-34 | Kept untestable infrastructure inventory removed. | copy audit |
| F-1-35 | Kept three fixture-family imports. | `@claim:import-formats` |
| F-1-36 | Kept limited warning behavior. | parser unit tests |
| F-1-37 | Kept worker/responsiveness marketing removed. | copy audit |
| F-1-38 | Kept registered size boundary. | `@claim:file-size-limit` |
| F-1-39 | Kept untested source-offset guarantee removed. | copy audit |
| F-1-40 | Kept schema jargon off the first screen. | copy audit |
| F-1-41 | Kept recovery metaphor removed. | copy audit |
| F-1-42 | Kept factual footer wording. | route test |
| F-1-43 | Kept decorative fake coordinates removed. | first-screen test |
| F-1-44 | Kept `Open Timeline JSON` action label. | first-screen test |
| F-1-45 | Kept privacy gate and vague action removed. | first-screen test |
| F-1-46 | Kept Timeline JSON/saved timeline terminology. | copy audit |
| F-1-47 | Kept descriptive privacy h1. | route test |
| F-1-48 | Kept concise README audience sentence. | copy audit |
| F-1-49 | Kept schema/worker jargon out of README. | copy audit |
| F-1-50 | Kept familiar entries and coordinate-map wording. | copy audit |
| F-1-51 | Kept plain opt-in tile wording. | copy audit |
| F-1-52 | Kept storage/offline statements split and now proves real persistence. | `@claim:real-local-persistence`, `@claim:offline-reload` |
| F-1-53 | Kept remote-stack jargon removed. | copy audit |
| F-1-54 | Kept README format prose plain. | copy audit |
| F-1-55 | Kept parser implementation prose removed. | copy audit |
| F-1-56 | Kept short executable verification instructions. | README command block |
| F-1-57 | Kept service-worker failure guard. | `viewer still works when service workers are unavailable` |
| F-1-58 | Kept external-source label. | axe/route tests |
| F-1-59 | Kept `Skip to main content`. | axe test |
| F-2-1 | Added a registry entry and storage inspection after **Start for real**. | `@claim:demo-discard` |
| F-2-2 | Removed static description; Svelte supplies exactly one route description. | `ships crawl files and route metadata` |
| F-2-3 | Added description, canonical, OG/Twitter card, and Apple icon to `404.html`. | `the static 404 includes complete noindex metadata` |

No finding is deferred. The visual system remains the warm-paper archival field atlas documented in `design.md`.
