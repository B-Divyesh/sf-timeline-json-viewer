import type { TimelineDataset } from './types';

/** Shipped sample data. It never uses or reads a visitor's saved timeline. */
export const demoDataset: TimelineDataset = {
  name: 'Sample Timeline JSON',
  schema: 'semanticSegments',
  importedAt: '2026-08-28T00:00:00.000Z',
  warnings: [],
  events: [
    { id: 'sample-visit', kind: 'visit', date: '2026-08-18', start: '2026-08-18T09:10:00-04:00', end: '2026-08-18T10:05:00-04:00', name: 'Riverfront Market', address: '18 Harbor Street', points: [{ lat: 42.3601, lng: -71.0589 }] },
    { id: 'sample-route', kind: 'trip', date: '2026-08-18', start: '2026-08-18T10:05:00-04:00', end: '2026-08-18T10:28:00-04:00', name: 'Walk to the museum', activity: 'WALKING', distanceMeters: 1650, points: [{ lat: 42.3601, lng: -71.0589, time: '2026-08-18T10:05:00-04:00' }, { lat: 42.3618, lng: -71.0537, time: '2026-08-18T10:28:00-04:00' }] },
    { id: 'sample-museum', kind: 'visit', date: '2026-08-18', start: '2026-08-18T10:30:00-04:00', end: '2026-08-18T12:10:00-04:00', name: 'Harbor City Museum', address: '55 Gallery Lane', points: [{ lat: 42.3618, lng: -71.0537 }] },
    { id: 'sample-cycle', kind: 'trip', date: '2026-08-20', start: '2026-08-20T17:20:00-04:00', end: '2026-08-20T18:02:00-04:00', name: 'Evening cycle', activity: 'CYCLING', distanceMeters: 7200, points: [{ lat: 42.352, lng: -71.064, time: '2026-08-20T17:20:00-04:00' }, { lat: 42.347, lng: -71.071, time: '2026-08-20T18:02:00-04:00' }] },
    { id: 'sample-cafe', kind: 'visit', date: '2026-08-20', start: '2026-08-20T18:05:00-04:00', end: '2026-08-20T18:45:00-04:00', name: 'Juniper Cafe', address: '4 Linden Square', points: [{ lat: 42.347, lng: -71.071 }] }
  ]
};
