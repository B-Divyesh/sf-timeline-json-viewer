# Review 2 handoff — Field Atlas

Work order: `timeline-json-viewer-review-2`
Reviewed commit: `a1ebd79fda6d47f6074bbeb87d603d28f8bf0009`

## Done

- Performed an adversarial cold first-read review of the live site at 390 px and desktop, including demo, privacy, offline, routing, links, metadata, and visual checks.
- Read the brief, design, claims registry, demo documentation, all earlier review/polish/verification records, and the prior handoff.
- Wrote the detailed result to `.factory/review-2.md`. No product code was changed.

## Verification run

After `npm ci` in the clean reviewed tree:

```sh
npm run check
npm test
npm run build
npm run check:bundle
npm run test:e2e
npm run test:axe
npm run test:claims
```

All commands passed: 0 check errors/warnings, 7 unit tests, build output, 34 end-to-end tests, 2 axe tests, and 24 claim-test cases (12 declared claims across desktop and mobile).

## Result and remaining work

Verdict is **FAIL**. The review records three blocking claim-accountability issues:

- Real saved-timeline persistence is claimed but only demo persistence is tested (F-1-21 recurrence).
- Optional OpenStreetMap tile privacy disclosure is not tested with a request log (F-1-23 recurrence).
- Demo discard on “Start for real” is claimed but not registered/tested (F-2-1).

It also records duplicate SPA meta descriptions (F-2-2) and incomplete cold static-404 metadata (F-2-3). The live demo itself, core importer/exporter flows, offline demo behavior, and declared claims currently work.
