# Demo sandbox

Open `https://timeline-json-viewer.sociobot.in/?demo=1` or `/demo`.

The shipped sample includes two days of visits, a walking route, and a cycling route. It opens directly in the calendar, text itinerary, coordinate map, search, and export view.

Demo data is stored only in IndexedDB database `demo:field-atlas-v1` and the `demo:field-atlas-date` local-storage key. It never reads or writes the real `field-atlas-v1` database. **Reset demo** replaces it with the shipped sample. **Start for real** deletes that demo store and returns to the importer.
