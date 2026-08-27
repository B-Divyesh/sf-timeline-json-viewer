import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseTimeline, parseTimelineText, dateKey } from '../src/lib/parse';

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));

describe('timeline schema parsing', () => {
  it('normalizes semanticSegments visits and paths', () => {
    const result = parseTimeline(fixture('semantic.json'));
    expect(result.schema).toBe('semanticSegments');
    expect(result.events).toHaveLength(2);
    expect(result.events[0]).toMatchObject({ kind: 'visit', date: '2025-03-01', name: 'Museum, Hall "A"' });
    expect(result.events[1].points).toHaveLength(2);
  });

  it('normalizes timelineObjects and E7 coordinates', () => {
    const result = parseTimeline(fixture('timeline-objects.json'));
    expect(result.schema).toBe('timelineObjects');
    expect(result.events[0].date).toBe('2024-02-29');
    expect(result.events[0].points[0]).toMatchObject({ lat: 51.5074, lng: -0.1278 });
    expect(result.events[1].activity).toBe('WALKING');
  });

  it('normalizes Records.json locations', () => {
    const result = parseTimeline(fixture('records.json'));
    expect(result.schema).toBe('records');
    expect(result.events).toHaveLength(2);
  });

  it('reports malformed and unsupported input clearly', () => {
    expect(() => parseTimelineText('{"semanticSegments": [}')).toThrow(/not valid JSON/);
    expect(() => parseTimeline({ hello: 'world' })).toThrow(/No supported timeline data/);
  });

  it('uses the source offset date at timezone boundaries', () => {
    expect(dateKey('2024-02-29T23:30:00-08:00')).toBe('2024-02-29');
    expect(dateKey('2024-03-01T00:30:00+14:00')).toBe('2024-03-01');
  });
});
