import { expect, test } from '@playwright/test';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';

const fixture = (name: string) => path.resolve('tests/fixtures', name);
async function archiveValue(page: import('@playwright/test').Page, database: string) {
  return page.evaluate(async (name) => {
    const found = await indexedDB.databases();
    if (!found.some((item) => item.name === name)) return null;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => {
        const db = request.result;
        const value = db.transaction('archive').objectStore('archive').get('current');
        value.onsuccess = () => { resolve(value.result ?? null); db.close(); };
        value.onerror = () => reject(value.error);
      };
      request.onerror = () => reject(request.error);
    });
  }, database);
}
async function demo(page: import('@playwright/test').Page) {
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: '2026-08-18, has timeline entries' }).click();
  await expect(page.getByText('Harbor City Museum')).toBeVisible();
}

test('@claim:demo-isolation opens sample data in an isolated store', async ({ page }) => {
  await demo(page);
  const names = await page.evaluate(async () => indexedDB.databases().then((items) => items.map((item) => item.name)));
  expect(names).toContain('demo:field-atlas-v1');
  expect(names).not.toContain('field-atlas-v1');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: 'Browse your exported Google Timeline' })).toBeVisible();
});
test('@claim:offline-reload keeps the shipped sample usable offline after first visit', async ({ page, context }) => {
  await demo(page); await page.evaluate(() => navigator.serviceWorker.ready); await context.setOffline(true); await page.reload();
  await expect(page.getByText('Harbor City Museum')).toBeVisible(); await expect(page.getByLabel('Search places and activities')).toBeVisible(); await expect(page.getByText('Offline')).toBeVisible();
});
test('@claim:import-formats opens Timeline, Takeout, and Records fixtures', async ({ page }) => {
  await demo(page);
  for (const [file, schema] of [['semantic.json', 'semanticSegments'], ['timeline-objects.json', 'timelineObjects'], ['records.json', 'records']] as const) {
    await page.locator('input[type=file]').first().setInputFiles(fixture(file)); await expect(page.locator('.archive-meta')).toContainText(schema);
  }
});
test('@claim:import-browse shows visits, trips, map text, and search in the sample', async ({ page }) => {
  await demo(page); await expect(page.getByText('Riverfront Market')).toBeVisible(); await expect(page.getByText('Walk to the museum')).toBeVisible(); await expect(page.getByLabel('Text itinerary for the coordinate map')).toBeVisible();
  await page.getByLabel('Search places and activities').fill('museum'); await expect(page.getByText('Harbor City Museum')).toBeVisible();
});
test('@claim:csv-export downloads an exact CSV range', async ({ page }) => {
  await demo(page); const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export CSV' }).click(); const stream = await (await event).createReadStream(); let text = ''; for await (const chunk of stream!) text += chunk;
  expect(text).toContain('date,start,end,type,name,address,activity,distance_m,latitude,longitude'); expect(text).toContain('Harbor City Museum');
});
test('@claim:gpx-export downloads GPX points and paths', async ({ page }) => {
  await demo(page); const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export GPX' }).click(); const stream = await (await event).createReadStream(); let text = ''; for await (const chunk of stream!) text += chunk;
  expect(text).toContain('<wpt lat="42.3618" lon="-71.0537">'); expect(text).toContain('<trkpt lat="42.3601" lon="-71.0589">');
});
test('@claim:kml-export downloads named points and paths', async ({ page }) => {
  await demo(page); const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export KML' }).click(); const stream = await (await event).createReadStream(); let text = ''; for await (const chunk of stream!) text += chunk;
  expect(text).toContain('<name>Harbor City Museum</name>'); expect(text).toContain('<LineString>'); expect(text).toContain('-71.0537,42.3618,0');
});
test('@claim:local-only sends no Timeline JSON data over the network', async ({ page }) => {
  const requests: { url: string; method: string; body: string | null }[] = []; page.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
  await demo(page); await page.locator('input[type=file]').first().setInputFiles(fixture('semantic.json')); await page.getByLabel('Search places and activities').fill('museum'); const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export CSV' }).click(); await event;
  expect(requests.every((request) => new URL(request.url).origin === new URL(page.url()).origin && request.method === 'GET' && !request.body)).toBe(true); expect(requests.join(' ')).not.toContain('Museum, Hall');
});
test('@claim:tiles-default-off starts the coordinate map without street tile requests', async ({ page }) => {
  const requests: string[] = []; page.on('request', (request) => requests.push(request.url())); await demo(page);
  expect(await page.getByLabel('Street tiles').isChecked()).toBe(false); expect(requests.some((url) => url.includes('tile.openstreetmap.org'))).toBe(false);
});
test('@claim:street-tiles requests OpenStreetMap only after opt-in and shows attribution', async ({ page, context }) => {
  await context.route('https://tile.openstreetmap.org/**', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') }));
  await demo(page); await page.getByLabel('Street tiles').check(); await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap contributors');
});
test('@claim:local-persistence restores the demo timeline after reload', async ({ page }) => {
  await demo(page); await page.reload(); await expect(page.getByText('Harbor City Museum')).toBeVisible(); expect(await page.evaluate(() => localStorage.getItem('demo:field-atlas-date'))).not.toBeNull();
});
test('@claim:real-local-persistence saves a real import until it is removed', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type=file]').first().setInputFiles(fixture('semantic.json'));
  await expect(page.getByText('Museum, Hall "A"')).toBeVisible();
  expect(await archiveValue(page, 'field-atlas-v1')).toMatchObject({ name: 'semantic.json' });
  await page.reload();
  await expect(page.getByText('Museum, Hall "A"')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByRole('heading', { name: 'Browse your exported Google Timeline' })).toBeVisible();
  expect(await archiveValue(page, 'field-atlas-v1')).toBeNull();
});
test('@claim:tile-request-privacy sends map-image GETs without Timeline JSON data', async ({ page, context }) => {
  const requests: { url: string; method: string; body: string | null }[] = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
  await context.route('https://tile.openstreetmap.org/**', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') }));
  await demo(page);
  await page.locator('input[type=file]').first().setInputFiles(fixture('semantic.json'));
  await page.getByLabel('Search places and activities').fill('Museum');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export CSV' }).click(); await download;
  await page.getByLabel('Street tiles').check();
  await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap contributors');
  const appOrigin = new URL(page.url()).origin;
  expect(requests.some((request) => new URL(request.url).origin === 'https://tile.openstreetmap.org')).toBe(true);
  expect(requests.every((request) => [appOrigin, 'https://tile.openstreetmap.org'].includes(new URL(request.url).origin) && request.method === 'GET' && !request.body)).toBe(true);
  expect(requests.map((request) => `${request.url} ${request.body ?? ''}`).join(' ')).not.toContain('Museum, Hall');
  expect(requests.map((request) => `${request.url} ${request.body ?? ''}`).join(' ')).not.toContain('40.7128');
});
test('@claim:demo-discard removes the sample before opening the real importer', async ({ page }) => {
  await demo(page);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: 'Browse your exported Google Timeline' })).toBeVisible();
  expect(await archiveValue(page, 'demo:field-atlas-v1')).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('demo:field-atlas-date'))).toBeNull();
  const databases = await page.evaluate(() => indexedDB.databases().then((items) => items.map((item) => item.name)));
  expect(databases).not.toContain('field-atlas-v1');
});
test('@claim:file-size-limit rejects a file larger than 200 MB before parsing', async ({ page }) => {
  const file = path.join(tmpdir(), `field-atlas-large-${Date.now()}.json`);
  await fs.writeFile(file, '{}'); await fs.truncate(file, 201 * 1024 * 1024);
  try { await page.goto('/'); await page.locator('input[type=file]').first().setInputFiles(file); await expect(page.getByRole('alert')).toContainText('larger than 200 MB'); }
  finally { await fs.unlink(file); }
});
