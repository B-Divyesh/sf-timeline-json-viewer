import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';

const timelineObjects = path.resolve('tests/fixtures/timeline-objects.json');
const semantic = path.resolve('tests/fixtures/semantic.json');
const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

async function acknowledgePrivacy(page: Page) {
  await page.getByRole('button', { name: 'Continue privately' }).click();
  await expect(page.locator('dialog')).not.toBeVisible();
}

async function importWithPicker(page: Page, fixture: string) {
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByText('Choose Timeline JSON').click();
  const chooser = await chooserPromise;
  await chooser.setFiles(fixture);
}

test('actual file picker yields an axe-clean populated calendar with keyboard day navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto('/');
  await acknowledgePrivacy(page);
  await importWithPicker(page, timelineObjects);
  await expect(page.getByText('walking', { exact: true })).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);

  const marchFirst = page.getByRole('button', { name: /2024-03-01, has timeline entries/ });
  await marchFirst.focus();
  await marchFirst.press('ArrowLeft');
  const leapDay = page.getByRole('button', { name: /2024-02-29, has timeline entries/ });
  await expect(leapDay).toBeFocused();
  await expect(page.locator('.day-heading h2')).toContainText('March 1, 2024');
  expect(await leapDay.evaluate((element) => getComputedStyle(element).outlineWidth)).toBe('3px');

  await page.keyboard.press('Enter');
  await expect(leapDay).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Library & Archive')).toBeVisible();
  await page.waitForTimeout(100);
  expect(errors).toEqual([]);
});

test('production preview loads Leaflet assets from /assets and renders OSM attribution', async ({ page, context }) => {
  await context.route('https://tile.openstreetmap.org/**', (route) => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: transparentPng
  }));
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto('/');
  await acknowledgePrivacy(page);
  await importWithPicker(page, semantic);
  await expect(page.getByText('Museum, Hall "A"')).toBeVisible();
  await expect(page.getByLabel('Street tiles')).toBeEnabled();

  const javascript = page.waitForResponse((response) => /\/assets\/leaflet-src-[^/]+\.js$/.test(new URL(response.url()).pathname));
  const stylesheet = page.waitForResponse((response) => /\/assets\/leaflet-[^/]+\.css$/.test(new URL(response.url()).pathname));
  await page.getByLabel('Street tiles').check();
  const [javascriptResponse, stylesheetResponse] = await Promise.all([javascript, stylesheet]);

  expect(javascriptResponse.ok()).toBe(true);
  expect(stylesheetResponse.ok()).toBe(true);
  expect(new URL(javascriptResponse.url()).pathname).toMatch(/^\/assets\/leaflet-src-/);
  expect(new URL(stylesheetResponse.url()).pathname).toMatch(/^\/assets\/leaflet-/);
  await expect(page.locator('.leaflet-host')).toBeVisible();
  await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap contributors');
  expect(errors).toEqual([]);
});

test('first worker claim preserves privacy state and offline reload stays offline', async ({ page, context }) => {
  const navigations: string[] = [];
  page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) navigations.push(frame.url()); });

  await page.goto('/');
  const dialog = page.locator('dialog[open]');
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue privately' })).toBeFocused();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    }
  });
  await page.waitForTimeout(100);
  await expect(dialog).toBeVisible();
  expect(navigations).toHaveLength(1);

  await acknowledgePrivacy(page);
  await expect(page.locator('.connection')).toContainText('Online');
  expect(await page.evaluate(() => localStorage.getItem('field-atlas-privacy-seen'))).toBe('1');

  await context.setOffline(true);
  await expect(page.locator('.connection')).toContainText('Offline');
  await page.reload();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('.connection')).toContainText('Offline');
  await expect(page.locator('dialog')).not.toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('field-atlas-privacy-seen'))).toBe('1');
});
