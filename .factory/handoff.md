# Review 3 handoff — Field Atlas

Work order: `timeline-json-viewer-review-3`

Reviewed commit: `9369cf53d871db563587a2750d90d9766edbc1f9`
Verdict: **FAIL**

## Done

- Performed fresh 390 × 844 and 1440 × 900 first-read checks without scrolling.
- Exercised direct demo, reset, real/demo storage, request logging, offline reload, route focus, Back, deep links, metadata, 404, crawl files, dead links, and visual identity on the live site.
- Read the brief, design, claims, demo documentation, both prior reviews, both polish maps, and the previous handoff.
- Rechecked every earlier review finding against live behavior and source.
- Ran every declared claim command separately from a clean clone at the reviewed commit.
- Added only `.factory/review-3.md` and this handoff; no product code was changed.

## Verification

Clean clone: `/tmp/timeline-review3.tiVgrB/repo`

| Command/check | Result |
|---|---|
| `npm ci` | PASS — 91 packages, 0 vulnerabilities |
| Every `.factory/claims.json` command | PASS — 15 commands, 30/30 browser cases |
| `npm run check` | PASS — 0 errors, 0 warnings |
| `npm test` | PASS — 7/7 |
| `npm run build` | PASS — `dist/` produced |
| `npm run check:bundle` | PASS — initial JS 73,869 B; CSS 17,130 B; fonts 0 B |
| `npm run test:e2e` | PASS — 42/42 |
| `npm run test:axe` | PASS — 2/2 |
| Live `TARGET_URL=https://timeline-json-viewer.sociobot.in npm run test:axe` | PASS — 2/2 |
| Live `verify-url.sh` | PASS — one h1/main, title/lang/alt/labels, no console errors |
| Live private demo flow | PASS — only same-origin bodyless GETs; offline reload retained data |
| Live real-data → Demo transition | **FAIL — real `semantic.json` rendered under the demo banner** |
| Live Privacy/Terms → Demo transition | **FAIL — empty importer rendered instead of sample** |
| Live populated workspace → Privacy → Back | **FAIL — importer replaced the saved workspace until reload** |

## Remaining work

`.factory/review-3.md` contains ten findings. Three are blocking: demo isolation/claim coverage, saved-state Back routing, and the incomplete required first-screen fact set. The remaining work is the static 404 chrome, query-demo canonical, and five copy corrections.

The key regression is in `src/App.svelte`: `changeRoute()` updates `path` and immediately calls `initialize()`, while storage scope and legal/demo flags are reactive derived values that can still describe the previous route. Tests must seed real data before navigating into demo and must preserve a populated workspace through browser history.

## Re-run

```sh
npm ci
npm run check
npm test
npm run build
npm run check:bundle
npm run test:e2e
npm run test:axe
node -e "for (const claim of require('./.factory/claims.json')) console.log(claim.test)" | while read command; do eval "$command"; done
```

Also run the new route-transition tests against the live custom domain. Passing the current suite alone is not sufficient because it does not reproduce the blocking state transitions.
