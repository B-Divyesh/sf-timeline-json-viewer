import type { TimelineDataset } from './types';

const DATABASE = 'field-atlas-v1';
const STORE = 'archive';

export type StorageScope = 'real' | 'demo';

function databaseName(scope: StorageScope): string {
  return scope === 'demo' ? 'demo:field-atlas-v1' : DATABASE;
}

function open(scope: StorageScope = 'real'): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName(scope), 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function hasDatabase(scope: StorageScope): Promise<boolean> {
  // `indexedDB.open()` creates an empty database as a side effect.  Avoid that
  // for reads so landing on the real importer cannot create or touch real
  // storage while a visitor is using the sample sandbox.
  if (!('databases' in indexedDB)) return true;
  const databases = await indexedDB.databases();
  return databases.some((database) => database.name === databaseName(scope));
}

export async function saveDataset(dataset: TimelineDataset, scope: StorageScope = 'real'): Promise<void> {
  const db = await open(scope);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(dataset, 'current');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadDataset(scope: StorageScope = 'real'): Promise<TimelineDataset | undefined> {
  if (!await hasDatabase(scope)) return undefined;
  const db = await open(scope);
  const result = await new Promise<TimelineDataset | undefined>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get('current');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

export async function clearDataset(scope: StorageScope = 'real'): Promise<void> {
  const db = await open(scope);
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).delete('current');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}
