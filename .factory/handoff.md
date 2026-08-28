# Polish 2 handoff — Field Atlas

Work order: `timeline-json-viewer-polish-2`
Product deployment commits: `e9fc1b225eea140aef1a23491bc9307f88e9e7e0`, `58b43088b80542af8008606cfab00cc46f4ce74f`

## Done

- Closed every finding in `review-1.md` and `review-2.md`; the full ID-to-change-to-evidence map is in `polish-2.md`.
- Added three missing enforceable claims: real saved-timeline persistence, map-tile request privacy, and demo discard. Real-store reads now avoid creating an empty real IndexedDB database.
- Removed duplicate SPA descriptions, set route-specific descriptions, and completed cold-static-404 metadata.
- Replaced the stale footer commit label with `Version 1.0.0`.
- Updated the verb-first catalog description and copy audit. The archival field-atlas visual system is unchanged.

## Verification

Clean clone: `/tmp/timeline-json-viewer-clean.rIbIEN`, cloned from `origin/main` at `e9fc1b2` before the footer-only follow-up.

| Check | Result |
|---|---|
| `npm ci` | PASS — 91 packages, 0 vulnerabilities |
| `npm run check` | PASS — 0 errors, 0 warnings |
| `npm test` | PASS — 7/7 unit tests |
| `npm run build` | PASS — `dist/` produced |
| `npm run check:bundle` | PASS — initial JS 73,869 B; CSS 17,130 B; fonts 0 B |
| Every declared claim command from the clean clone | PASS — 15 commands, 2 browser projects each, 30 cases total |
| `npm run test:e2e` | PASS — 42/42 local browser cases after the footer follow-up |
| `npm run test:axe` | PASS — 2/2 serious/critical populated-state audits |
| Live `npm run test:claims` | PASS — 30/30 at `https://timeline-json-viewer.sociobot.in` |
| Live `npm run test:e2e` | PASS — 42/42 at the custom domain |
| Live `npm run test:axe` | PASS — 2/2 at the custom domain |
| Live Lighthouse mobile demo | PASS — Performance 99, Accessibility 100, LCP 1.1 s, CLS 0 |

The live 404 check returned HTTP 404, `text/html`, and its noindex description, canonical `/404`, OG/Twitter card, SVG favicon, and Apple touch icon. The deployed footer was checked cold and shows `Version 1.0.0`.

## Deployment and evidence

Deployed through `/opt/fleet/lib/deploy-static.sh timeline-json-viewer dist` using the work-order static configuration. Azure Static Web Apps reported deployment `a21dd924-d7af-44b0-9664-fe56230c3ad5` successful; the final custom-domain artifact was rebuilt and deployed for `58b4308`.

Live demo screenshots (fresh contexts):

- `/tmp/field-atlas-polish-2-desktop-final.png`
- `/tmp/field-atlas-polish-2-mobile-final.png`

Live URL: <https://timeline-json-viewer.sociobot.in/?demo=1>

## Run locally

```sh
npm ci
npm run check
npm test
npm run build
npm run check:bundle
npm run test:e2e
npm run test:axe
npm run test:claims
```

No known gaps remain.
