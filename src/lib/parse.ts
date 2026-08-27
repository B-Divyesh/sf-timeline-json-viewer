import type { Point, TimelineDataset, TimelineEvent } from './types';

type AnyObject = Record<string, any>;

function object(value: unknown): AnyObject {
  return value && typeof value === 'object' ? value as AnyObject : {};
}

function validPoint(point: Point): boolean {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180;
}

export function parsePoint(value: unknown, time?: string): Point | undefined {
  if (typeof value === 'string') {
    const match = value.match(/(?:geo:)?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i);
    if (match) {
      const point = { lat: Number(match[1]), lng: Number(match[2]), time };
      return validPoint(point) ? point : undefined;
    }
  }
  const item = object(value);
  const latRaw = item.latitudeE7 ?? item.latE7 ?? item.latitude ?? item.lat;
  const lngRaw = item.longitudeE7 ?? item.lngE7 ?? item.longitude ?? item.lng ?? item.lon;
  if (latRaw == null || lngRaw == null) return undefined;
  const latNumber = Number(latRaw);
  const lngNumber = Number(lngRaw);
  const point = {
    lat: Math.abs(latNumber) > 90 ? latNumber / 1e7 : latNumber,
    lng: Math.abs(lngNumber) > 180 ? lngNumber / 1e7 : lngNumber,
    time: time ?? item.timestamp ?? item.time
  };
  return validPoint(point) ? point : undefined;
}

function iso(value: unknown, fallback?: string): string {
  if (typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.valueOf())) return value;
    if (/^\d+$/.test(value)) return new Date(Number(value)).toISOString();
  }
  if (typeof value === 'number') return new Date(value).toISOString();
  return fallback ?? new Date(0).toISOString();
}

export function dateKey(timestamp: string): string {
  const explicit = timestamp.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (explicit) return explicit[1];
  const date = new Date(timestamp);
  if (Number.isNaN(date.valueOf())) return 'unknown';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function duration(item: AnyObject): [string, string] {
  const span = object(item.duration);
  const start = iso(item.startTime ?? span.startTimestamp ?? span.startTimestampMs ?? item.timestamp);
  const end = iso(item.endTime ?? span.endTimestamp ?? span.endTimestampMs, start);
  return [start, end];
}

function semanticEvent(segment: AnyObject, index: number): TimelineEvent | undefined {
  const [start, end] = duration(segment);
  const visit = object(segment.visit);
  const candidate = object(visit.topCandidate);
  const activity = object(segment.activity);
  const points: Point[] = [];
  const visitPoint = parsePoint(candidate.placeLocation?.latLng ?? candidate.placeLocation ?? visit.location);
  if (visitPoint) points.push(visitPoint);
  for (const item of Array.isArray(segment.timelinePath) ? segment.timelinePath : []) {
    const point = parsePoint(item.point ?? item, item.time);
    if (point) points.push(point);
  }
  for (const key of ['start', 'end']) {
    const value = object(activity[key]);
    const point = parsePoint(value.latLng ?? value);
    if (point) points.push(point);
  }
  const isVisit = Boolean(segment.visit);
  if (!isVisit && !segment.activity && points.length === 0) return undefined;
  return {
    id: `semantic-${index}`,
    kind: isVisit ? 'visit' : 'trip',
    start,
    end,
    date: dateKey(start),
    name: candidate.placeName ?? candidate.name ?? visit.hierarchyLevel ?? (isVisit ? 'Unnamed visit' : activity.topCandidate?.type?.replaceAll('_', ' ') ?? 'Recorded trip'),
    address: candidate.placeAddress ?? candidate.address,
    activity: activity.topCandidate?.type ?? activity.type,
    distanceMeters: Number(activity.distanceMeters ?? segment.distanceMeters) || undefined,
    points
  };
}

function legacyEvent(wrapper: AnyObject, index: number): TimelineEvent | undefined {
  const visit = wrapper.placeVisit && object(wrapper.placeVisit);
  const trip = wrapper.activitySegment && object(wrapper.activitySegment);
  const item = visit || trip;
  if (!item) return undefined;
  const [start, end] = duration(item);
  const points: Point[] = [];
  if (visit) {
    const p = parsePoint(visit.location ?? { latitudeE7: visit.centerLatE7, longitudeE7: visit.centerLngE7 });
    if (p) points.push(p);
  } else {
    for (const p of [trip.startLocation, ...(trip.waypointPath?.waypoints ?? []), ...(trip.simplifiedRawPath?.points ?? []), trip.endLocation]) {
      const parsed = parsePoint(p, p?.timestamp);
      if (parsed) points.push(parsed);
    }
  }
  return {
    id: `legacy-${index}`,
    kind: visit ? 'visit' : 'trip',
    start,
    end,
    date: dateKey(start),
    name: visit ? (visit.location?.name ?? visit.location?.address ?? 'Unnamed visit') : (trip.activityType?.replaceAll('_', ' ') ?? 'Recorded trip'),
    address: visit?.location?.address,
    activity: trip?.activityType,
    distanceMeters: Number(trip?.distance) || undefined,
    points
  };
}

function recordEvents(items: unknown[]): TimelineEvent[] {
  const records = items.map<TimelineEvent | undefined>((raw, index) => {
    const item = object(raw);
    const start = iso(item.timestamp ?? item.timestampMs);
    const point = parsePoint(item, start);
    if (!point) return undefined;
    return {
      id: `record-${index}`,
      kind: 'record' as const,
      start,
      end: start,
      date: dateKey(start),
      name: item.name ?? 'Location record',
      points: [point]
    };
  }).filter((event): event is TimelineEvent => event !== undefined);
  return records;
}

export function parseTimeline(input: unknown, name = 'Timeline.json'): TimelineDataset {
  const root = object(input);
  let schema: TimelineDataset['schema'];
  let events: TimelineEvent[];
  if (Array.isArray(root.semanticSegments)) {
    schema = 'semanticSegments';
    events = root.semanticSegments.map(semanticEvent).filter((event): event is TimelineEvent => Boolean(event));
  } else if (Array.isArray(root.timelineObjects)) {
    schema = 'timelineObjects';
    events = root.timelineObjects.map(legacyEvent).filter((event): event is TimelineEvent => Boolean(event));
  } else {
    const records = Array.isArray(input) ? input : root.locations;
    if (!Array.isArray(records)) throw new Error('No supported timeline data was found. Expected semanticSegments, timelineObjects, or locations.');
    schema = 'records';
    events = recordEvents(records);
  }
  events.sort((a, b) => new Date(a.start).valueOf() - new Date(b.start).valueOf());
  if (events.length === 0) throw new Error(`The ${schema} structure was recognized, but it contained no usable visits, trips, or coordinates.`);
  const omitted = (schema === 'semanticSegments' ? root.semanticSegments.length : schema === 'timelineObjects' ? root.timelineObjects.length : (Array.isArray(input) ? input.length : root.locations.length)) - events.length;
  return {
    name,
    schema,
    importedAt: new Date().toISOString(),
    events,
    warnings: omitted > 0 ? [`${omitted.toLocaleString()} unsupported or empty item${omitted === 1 ? ' was' : 's were'} skipped.`] : []
  };
}

export function parseTimelineText(text: string, name = 'Timeline.json'): TimelineDataset {
  let json: unknown;
  try { json = JSON.parse(text); }
  catch (error) {
    const detail = error instanceof Error ? error.message.replace(/at position \d+/, 'near the reported position') : 'invalid syntax';
    throw new Error(`This file is not valid JSON (${detail}). Export it again or choose Timeline.json / Records.json.`);
  }
  return parseTimeline(json, name);
}
