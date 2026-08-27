# Verifier handoff

Date: 2026-08-27

Work order: `timeline-json-viewer-verify-1`

Candidate: `d9baa843b88af1432fed9b30eb2f0695b50a5d28`

Verdict: **FAIL**

Independent verification was performed from a detached clean worktree against both the production build and <https://timeline-json-viewer.sociobot.in>. The live artifact matches the candidate by SHA-256. Core imports for all three schemas, day browsing, search, date-range CSV/GPX, persistence, offline reload, keyboard traversal, reduced motion, and local-only privacy behavior worked.

Release blockers and high-priority defects:

1. Populated-state axe reports a critical `aria-required-children` violation in the calendar grid; arrow-key grid behavior is also absent.
2. Street Tiles is broken in production because the inlined main bundle requests the Leaflet chunk from `/leaflet-src-Byf149Wh.js` instead of `/assets/leaflet-src-Byf149Wh.js`; OSM attribution never renders.
3. Every file-picker import raises `Cannot set properties of null (setting 'value')` because `event.currentTarget` is accessed after an `await`.

Lower-priority observations are an inaccurate Online badge after service-worker-cached offline reload and a first-install worker-claim race that can reopen the privacy modal. No product code was changed. Full commands, measurements, privacy proof, parity hashes, and prioritized fixes are in `.factory/verification.md`.

To reproduce the repository gates:

```sh
npm ci
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Before re-verification, add populated-state axe and console-error assertions to the permanent E2E suite, then cover the Street Tiles dynamic import and attribution on both desktop and Pixel-class mobile.
