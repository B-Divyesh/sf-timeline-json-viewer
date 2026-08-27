import type { TimelineEvent } from './types';

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function eventsToCsv(events: TimelineEvent[]): string {
  const rows = [['date', 'start', 'end', 'type', 'name', 'address', 'activity', 'distance_m', 'latitude', 'longitude']];
  for (const event of events) {
    const point = event.points[0];
    rows.push([event.date, event.start, event.end, event.kind, event.name, event.address ?? '', event.activity ?? '', event.distanceMeters?.toString() ?? '', point?.lat.toString() ?? '', point?.lng.toString() ?? '']);
  }
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

function xml(value: unknown): string {
  return String(value ?? '').replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
}

export function eventsToGpx(events: TimelineEvent[]): string {
  const parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<gpx version="1.1" creator="Field Atlas" xmlns="http://www.topografix.com/GPX/1/1">'];
  for (const event of events) {
    if (event.kind === 'visit' && event.points[0]) {
      const point = event.points[0];
      parts.push(`  <wpt lat="${point.lat}" lon="${point.lng}"><time>${xml(event.start)}</time><name>${xml(event.name)}</name>${event.address ? `<desc>${xml(event.address)}</desc>` : ''}</wpt>`);
    } else if (event.points.length) {
      parts.push(`  <trk><name>${xml(event.name)}</name><trkseg>`);
      for (const point of event.points) parts.push(`    <trkpt lat="${point.lat}" lon="${point.lng}">${point.time ? `<time>${xml(point.time)}</time>` : ''}</trkpt>`);
      parts.push('  </trkseg></trk>');
    }
  }
  parts.push('</gpx>');
  return parts.join('\n');
}

export function download(text: string, type: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
