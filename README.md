# Field Atlas — browse Google Timeline JSON

Field Atlas is for people with a Timeline JSON file they cannot open. It shows days, visits, trips, and coordinate-map details in the browser.

Try the isolated sample at [timeline-json-viewer.sociobot.in/?demo=1](https://timeline-json-viewer.sociobot.in/?demo=1).

## What it does

- Opens Timeline.json, legacy Google Takeout JSON, and Records.json.
- Shows visits, trips, coordinate-map text, and place search.
- Exports a selected date range as CSV, GPX, or KML.
- Keeps the shipped sample available after refresh and offline after its first visit.
- Starts street tiles off. OpenStreetMap tiles load only after you turn them on.
- Rejects Timeline JSON files larger than 200 MB before parsing.

Field Atlas sends no Timeline JSON data to a server. The demo uses a separate browser store and never touches a saved timeline. Read the in-app [privacy page](https://timeline-json-viewer.sociobot.in/privacy) before opening personal data.

## Run and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run check
npm test
npm run build
npm run check:bundle
npm run test:e2e
npm run test:axe
```

Run every declared product claim from a clean clone:

```sh
node -e "for (const claim of require('./.factory/claims.json')) console.log(claim.test)" | while read command; do eval "$command"; done
```

`npm run build` creates `dist/`. Deploy that directory to Azure Static Web Apps. The service worker precaches the app shell and the shipped sample route.

## Privacy and limits

A saved timeline stays in this browser until you remove it or clear site data. Optional tile requests send map-image GETs, not Timeline JSON data.

Google changes export formats. Keep the original Timeline JSON as your backup.

## Project files

- `.factory/claims.json` lists every testable product claim.
- `.factory/demo.md` describes the isolated sample sandbox.
- `.factory/design.md` records the archival field-atlas visual system.
- `.factory/handoff.md` records release verification.

Licensed under the MIT License.
