import { describe, expect, it } from 'vitest';
import { eventsToCsv, eventsToGpx } from '../src/lib/export';
import { parseTimeline } from '../src/lib/parse';
import { readFileSync } from 'node:fs';

const semantic = JSON.parse(readFileSync(new URL('./fixtures/semantic.json', import.meta.url), 'utf8'));

describe('exports', () => {
  const events = parseTimeline(semantic).events;

  it('escapes CSV commas, quotes, and line breaks', () => {
    const csv = eventsToCsv(events);
    expect(csv).toContain('"Museum, Hall ""A"""');
    expect(csv).toContain('"1 Main St\nSpringfield"');
    expect(csv.startsWith('\uFEFFdate,start')).toBe(true);
  });

  it('escapes GPX XML and emits waypoints and tracks', () => {
    const gpx = eventsToGpx(events);
    expect(gpx).toContain('<wpt lat="40.7128" lon="-74.006">');
    expect(gpx).toContain('<trk>');
    const extra = structuredClone(events);
    extra[0].name = 'Tea & <Maps> "Club"';
    expect(eventsToGpx(extra)).toContain('Tea &amp; &lt;Maps&gt; &quot;Club&quot;');
  });
});
