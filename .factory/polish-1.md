# Polish 1 finding map

Base reviewed: 592e17a325c51af80699a3da0f5ee28b43da2b56. All claim evidence starts at /?demo=1.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Removed cold privacy gate; added job/user h1 and first-screen actions. | app first-screen test |
| F-1-2 | Added direct demo, banner, reset/exit, sample, and demo IndexedDB namespace. | claim demo-isolation |
| F-1-3 | Added claims registry and 12 tagged observable tests. | npm run test:claims |
| F-1-4 | Added 404.html, SPA 404 view, and Azure 404 response override. | route test, cold live check |
| F-1-5 | Removed wordmark h1; every route has a page h1. | route and axe tests |
| F-1-6 | Added canonical, OG/Twitter, favicon, Apple icon, and social card. | metadata route test |
| F-1-7 | Added History navigation, h1 focus, and polite announcement. | route focus/back test |
| F-1-8 | Added real robots.txt and sitemap.xml outside fallback. | crawl-files test |
| F-1-9 | Added Demo nav, preview, three steps, privacy limits, full footer. | first-screen/route tests |
| F-1-10 | Added date-range KML export. | claim kml-export |
| F-1-11 | Pinned Playwright 1.58.2; serial browser verification is stable. | test:e2e, 34/34 |
| F-1-12 | Replaced loose offline copy with registered sample-offline fact. | claim offline-reload |
| F-1-13 | Rewrote format copy plainly and tested all three files. | claim import-formats |
| F-1-14 | Replaced broad processing promise with precise local-only claim. | claim local-only |
| F-1-15 | Kept documented limit and tested 201 MB rejection. | claim file-size-limit |
| F-1-16 | Removed untestable no-account fact. | local-only request claim |
| F-1-17 | Replaced with tested sample offline statement. | claim offline-reload |
| F-1-18 | Added explicit CSV/GPX/KML exports and content tests. | export claims |
| F-1-19 | Removed modal privacy slogan; policy is precise. | claim local-only |
| F-1-20 | Removed architecture assertion from visitor copy. | request-log claim |
| F-1-21 | Split into documented demo persistence. | claim local-persistence |
| F-1-22 | Reworded map behavior; default private map is tested. | claim tiles-default-off |
| F-1-23 | Rewrote optional tile disclosure in plain words. | claim street-tiles |
| F-1-24 | Tested viewer output with sample visits/trips/search/map text. | claim import-browse |
| F-1-25 | Removed “maintained” language. | copy audit |
| F-1-26 | Split formats and size into distinct claims. | import/size claims |
| F-1-27 | Removed unmeasured responsiveness promise. | no longer claimed |
| F-1-28 | Replaced with tested browse output claim. | claim import-browse |
| F-1-29 | Kept only tested opt-in tile behavior. | claim street-tiles |
| F-1-30 | Kept and tested default-off state. | claim tiles-default-off |
| F-1-31 | Added exact download content tests. | CSV/GPX/KML claims |
| F-1-32 | Replaced compound PWA copy with offline/persistence claims. | related claims |
| F-1-33 | Narrowed to testable demo request boundary. | claim local-only |
| F-1-34 | Removed untestable stack inventory. | request log and CSP |
| F-1-35 | Tested three supported schema fixtures. | claim import-formats |
| F-1-36 | Kept actionable warning; no complete-coverage promise. | parser unit tests |
| F-1-37 | Removed technical worker/responsiveness promise. | no longer claimed |
| F-1-38 | Registered retained 200 MB promise. | claim file-size-limit |
| F-1-39 | Removed untested source-offset guarantee. | no longer claimed |
| F-1-40 | Replaced timelineObjects first-screen jargon. | copy audit |
| F-1-41 | Removed recovery-desk metaphor. | copy audit |
| F-1-42 | Replaced footer slogan with factual sentence. | route test |
| F-1-43 | Removed decorative coordinates. | first-screen test |
| F-1-44 | Standardized Open Timeline JSON action label. | first-screen test |
| F-1-45 | Removed gate and vague button. | first-screen test |
| F-1-46 | Standardized Timeline JSON and saved timeline terminology. | copy audit |
| F-1-47 | Replaced privacy slogan with descriptive h1. | route test |
| F-1-48 | Rewrote README audience copy within sentence cap. | copy audit |
| F-1-49 | Removed schema/worker jargon from README. | copy audit |
| F-1-50 | Replaced ledger/plot jargon with entries/coordinate map. | copy audit |
| F-1-51 | Replaced lazy-loading jargon with opt-in wording. | copy audit |
| F-1-52 | Split compound storage/offline copy. | claims registry |
| F-1-53 | Removed technical CDN inventory. | copy audit |
| F-1-54 | Replaced fixture/schema prose with format names. | copy audit |
| F-1-55 | Removed JSON.parse/main-thread prose. | copy audit |
| F-1-56 | Rewrote verification copy as short commands. | README |
| F-1-57 | Guarded service-worker registration with try/catch. | no-service-worker test |
| F-1-58 | Labels GitHub source as opening another site. | route/axe test |
| F-1-59 | Changed skip link to Skip to main content. | axe test |

Passing test evidence is produced by the permanent suite. The live smoke URL is https://timeline-json-viewer.sociobot.in/?demo=1; desktop cold screenshot: `/tmp/field-atlas-live.png`. The custom domain returned the new title and HTTP 404 route after Azure deployment.
