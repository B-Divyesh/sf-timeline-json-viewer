import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'node:path';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  const privacy = page.getByRole('button', { name: 'Continue privately' });
  await privacy.click();
});

test('imports, browses, searches, and exposes export actions', async ({ page }) => {
  await page.locator('input[type="file"]').first().setInputFiles(path.resolve('tests/fixtures/semantic.json'));
  await expect(page.getByText('Museum, Hall "A"')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled();
  await page.getByLabel('Search places and activities').fill('vehicle');
  await expect(page.getByText('in passenger vehicle', { exact: true })).toBeVisible();
  await expect(page.getByText('Museum, Hall "A"')).toBeHidden();
});

test('restores the imported archive with the network offline', async ({ page, context }) => {
  await page.locator('input[type="file"]').first().setInputFiles(path.resolve('tests/fixtures/timeline-objects.json'));
  await page.getByRole('button', { name: 'Previous day with entries' }).click();
  await expect(page.getByText('Library & Archive')).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect(page.getByText('Library & Archive')).toBeVisible();
  await context.setOffline(true);
  await expect(page.getByText('Offline')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Library & Archive')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export GPX' })).toBeEnabled();
});

test('has no serious accessibility or load-console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.reload();
  await expect(page.locator('main')).toBeVisible();
  expect(await page.locator('h1').count()).toBe(1);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
});
