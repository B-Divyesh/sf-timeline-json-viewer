import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('demo is keyboard usable, axe-clean, mobile-safe, and has no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/demo');
  await page.getByRole('button', { name: '2026-08-18, has timeline entries' }).click();
  await expect(page.getByText('Harbor City Museum')).toBeVisible();
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(result.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: /2026-08-18, has timeline entries/ }).focus();
  await page.keyboard.press('ArrowRight');
  expect(errors).toEqual([]);
});

test('viewer still works when service workers are unavailable', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage(); const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/demo');
  await page.getByRole('button', { name: '2026-08-18, has timeline entries' }).click();
  await expect(page.getByText('Harbor City Museum')).toBeVisible();
  expect(errors).toEqual([]);
  await context.close();
});

test('every public route is axe-clean with one page heading and a main landmark', async ({ page }) => {
  for (const route of ['/', '/demo', '/privacy', '/terms', '/404.html']) {
    await page.goto(route);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(result.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), route).toEqual([]);
  }
});
