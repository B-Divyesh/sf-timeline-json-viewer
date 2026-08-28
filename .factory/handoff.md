# Polish 3 handoff — Field Atlas

Work order: `timeline-json-viewer-polish-3`

Reviewed candidate: `9369cf53d871db563587a2750d90d9766edbc1f9`

Review report: `940b56a0928ec1b0ec9bc728b2b838e9933f293a`

Deployed implementation: `0ba8555c051d7071a32d33a132d1e54b7cb7be15`
Live URL: <https://timeline-json-viewer.sociobot.in>

## Done

- Made destination route state explicit before reading IndexedDB, so Demo can never render a real saved timeline and legal-page Demo links always seed the sample.
- Preserved and restored the real workspace through Privacy, Back, Forward, Demo, Reset demo, and Start for real.
- Expanded `@claim:demo-isolation` to seed real data and test every reported transition on desktop and mobile.
- Replaced the first-screen facts with explicit upload, offline, and free statements; added `@claim:free-to-use`.
- Added exact sample-content coverage, `/?demo=1` canonical coverage, 390 × 844 fold coverage, and full public-route axe coverage.
- Completed the static 404 with the Field Atlas header, skip link, navigation, footer, legal links, version, and factory credit.
- Removed the unsupported adjective, vague export heading, service-worker jargon claim, HTTP jargon, and inconsistent product label.
- Deferred service-worker registration until after page load and limited browser suites to one intentional worker lifecycle: the offline claim. This removed the live navigation/readiness race without weakening offline coverage.
- Updated the PWA cache version, demo documentation, catalog description, claims registry, copy audit, and review mapping.

## Verification

Final clean clone: `/tmp/timeline-polish3-final.VRQeY4/repo` at `0ba8555`.

| Check | Result |
|---|---|
| `npm ci` | PASS — 91 packages, 0 vulnerabilities. |
| Every command in `.factory/claims.json`, separately | PASS — 16 commands, 32/32 project cases. |
| `npm run check` | PASS — 0 errors, 0 warnings. |
| `npm test` | PASS — 7/7 unit tests. |
| `npm run build` | PASS — `dist/` produced. |
| `npm run check:bundle` | PASS — initial JS 74,603 B; CSS 17,130 B; fonts 0 B. |
| `npm run test:e2e` | PASS — 50/50 browser cases. |
| `npm run test:axe` | PASS — 4/4 desktop/mobile route audits. |
| Live `npm run test:e2e`, consecutive run 1 | PASS — 50/50 in 54.0 s. |
| Live `npm run test:e2e`, consecutive run 2 | PASS — 50/50 in 47.4 s. |
| Live `npm run test:axe` | PASS — 4/4. |
| Live `verify-url.sh` on `/` | PASS — 200, 712 ms, one h1/main, no missing alt, no unlabeled buttons, no console errors. |
| Live `verify-url.sh` on `/?demo=1` | PASS — 200, 671 ms, Demo title, one h1/main, no console errors. |
| Live cold transition replay | PASS — only `Sample Timeline JSON` in Demo; real `semantic.json` unchanged; Reset and Start for real correct; Back focused the restored h1. |
| Live cold unknown URL | PASS — HTTP 404 with skip link, header/navigation, footer, Privacy, Terms, version, and factory credit. |
| Live Lighthouse mobile | PASS — performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.1 s, CLS 0.009, TBT 100 ms. |

The first post-deploy run of the earlier implementation found the historical service-worker race (47/50). Commit `0ba8555` fixed its cause; both full live runs above are after that fix and contain no retry or failure.

## Evidence files

- Root: `/tmp/field-atlas-polish-3-live/root/screenshot-desktop.png`, `/tmp/field-atlas-polish-3-live/root/screenshot-mobile.png`
- Direct demo: `/tmp/field-atlas-polish-3-live/demo/screenshot-desktop.png`, `/tmp/field-atlas-polish-3-live/demo-cold-mobile.png`
- Demo entered after real data: `/tmp/field-atlas-polish-3-live/demo-after-real.png`
- Cold 404: `/tmp/field-atlas-polish-3-live/404-cold-mobile.png`
- Lighthouse JSON: `/tmp/field-atlas-polish-3-live/lighthouse.json`
- Deployment ID: `3d8501af-5c33-49f6-bc3d-385a00561dca`

## Known gaps and next steps

No review finding, claim, test failure, or release blocker remains. Deployment infrastructure, DNS, and billing remain outside this repository as required.
