export type Point = { lat: number; lng: number; time?: string };

export type TimelineEvent = {
  id: string;
  kind: 'visit' | 'trip' | 'record';
  start: string;
  end: string;
  date: string;
  name: string;
  address?: string;
  activity?: string;
  distanceMeters?: number;
  points: Point[];
};

export type TimelineDataset = {
  name: string;
  schema: 'semanticSegments' | 'timelineObjects' | 'records';
  importedAt: string;
  events: TimelineEvent[];
  warnings: string[];
};

export type WorkerResponse =
  | { type: 'progress'; progress: number; message: string }
  | { type: 'complete'; dataset: TimelineDataset }
  | { type: 'error'; message: string };
