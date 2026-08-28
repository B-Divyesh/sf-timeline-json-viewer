# Copy audit — polish 3

Word counts ignore standalone punctuation and treat filenames and hyphenated terms as one word. No sentence exceeds 22 words. No banned term appears.

## First screen

| Words | Copy | Evidence |
|---:|---|---|
| 4 | Local Timeline JSON viewer | One product category in header and kicker. |
| 5 | Browse your exported Google Timeline | Verb-led job heading. |
| 10 | For people with a Timeline JSON file they cannot open. | Names the visitor and situation. |
| 5 | Try it with sample data | One-click demo action. |
| 3 | Open Timeline JSON | Real-data action. |
| 12 | The sample opens the calendar, map, and CSV, GPX, or KML exports. | Names the immediate result. |
| 4 | No Timeline JSON upload | `local-only`. |
| 7 | Sample works offline after your first visit | `offline-reload`. |
| 3 | Free to use | `free-to-use`. |

The full decision set fits above the fold at 390 × 844 in `the complete first-screen decision fits at 390 by 844 pixels`.

## Landing sections and footer

| Words | Copy | Evidence |
|---:|---|---|
| 4 | Visits and named places | Entry key. |
| 3 | Trips and paths | Entry key. |
| 3 | Raw location records | Entry key. |
| 4 | Parsed in this browser | `local-only`. |
| 5 | See a sample timeline first | Section heading. |
| 12 | The sample includes three visits, a walking route, and a cycling route. | `import-browse`. |
| 6 | It never reads your saved timeline. | `demo-isolation`. |
| 4 | Open the sample viewer | Demo action. |
| 3 | How it works | Section heading. |
| 3 | Open a file | Step heading. |
| 9 | Choose Timeline.json, Records.json, or a legacy Google Takeout file. | `import-formats`. |
| 2 | Browse days | Step heading. |
| 12 | Find visits, trips, and raw records in the calendar and coordinate map. | `import-browse`. |
| 4 | Export a date range | Step heading. |
| 10 | Export a selected date range as CSV, GPX, or KML. | Export claim tests. |
| 6 | What Field Atlas does not do | Limits section heading. |
| 8 | Street tiles stay off until you choose them. | `tiles-default-off`. |
| 7 | The sample never touches your saved timeline. | `demo-isolation`. |
| 9 | Read how local storage and optional map tiles work. | Legal-page link. |
| 8 | Field Atlas reads Timeline JSON in your browser. | `local-only`. |

## Privacy and demo copy

| Words | Copy | Evidence |
|---:|---|---|
| 6 | Demo — sample data, nothing is saved | Required demo banner. |
| 8 | Explore the viewer without touching your saved timeline. | `demo-isolation`. |
| 9 | Field Atlas reads a Timeline JSON in your browser. | `local-only`. |
| 13 | It does not send the file, entries, searches, or exports to Field Atlas. | `local-only`. |
| 16 | Your saved timeline stays in this browser until you remove it or clear this site’s data. | `real-local-persistence`. |
| 7 | The demo uses a separate browser store. | `demo-isolation`. |
| 9 | Starting for real discards the isolated demo timeline. | `demo-discard`. |
| 7 | The coordinate map starts without street tiles. | `tiles-default-off`. |
| 13 | If you turn on OpenStreetMap tiles, the browser requests map images from OpenStreetMap. | `street-tiles`. |
| 6 | Optional tile requests fetch map images. | `tile-request-privacy`. |
| 6 | They never include Timeline JSON data. | `tile-request-privacy`. |

## README statements

All product outcomes in `README.md` map to `import-formats`, `import-browse`, the three export claims, `local-persistence`, `offline-reload`, `tiles-default-off`, `street-tiles`, `file-size-limit`, `local-only`, `demo-isolation`, `real-local-persistence`, or `tile-request-privacy`. Developer instructions state prerequisites or commands and make no visitor-facing performance claim. The unlisted service-worker implementation claim from F-3-8 was removed.

## Terminology

| Concept | One term |
|---|---|
| User-supplied source | Timeline JSON |
| Browser-saved parsed data | saved timeline |
| Generic item | entry |
| Map without remote tiles | coordinate map |
| Remote map | OpenStreetMap tiles / street tiles |
| Product category | Local Timeline JSON viewer |
