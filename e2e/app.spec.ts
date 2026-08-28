import { expect, test } from '@playwright/test';
import path from 'node:path';

const fixture = (name: string) => path.resolve('tests/fixtures', name);

test('first screen names the job and opens the sample in one click', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Browse your exported Google Timeline' })).toBeVisible();
  await expect(page.getByText('For people with a Timeline JSON file they cannot open.')).toBeVisible();
  await expect(page.locator('.trust-list li').filter({ hasText: 'No Timeline JSON upload' })).toBeVisible();
  await expect(page.locator('.trust-list li').filter({ hasText: 'Sample works offline after your first visit' })).toBeVisible();
  await expect(page.locator('.trust-list li').filter({ hasText: 'Free to use' })).toBeVisible();
  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: '2026-08-18, has timeline entries' }).click();
  await expect(page.getByText('Harbor City Museum')).toBeVisible();
});

test('the complete first-screen decision fits at 390 by 844 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const bounds = await page.locator('.trust-list li').last().boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
  await expect(page.getByRole('button', { name: 'Try it with sample data' })).toBeInViewport();
  await expect(page.locator('.trust-list li')).toHaveCount(3);
});

test('browser history and leaving demo restore the same saved workspace', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type=file]').first().setInputFiles(fixture('semantic.json'));
  await expect(page.getByText('Museum, Hall "A"')).toBeVisible();
  await expect(page.getByText('Saturday, March 1, 2025')).toBeVisible();

  await page.getByLabel('Primary').getByRole('link', { name: 'Privacy' }).click();
  await expect(page.getByRole('heading', { name: 'How Field Atlas handles your data' })).toBeFocused();
  await page.goBack();
  await expect(page.locator('.archive-meta')).toContainText('semantic.json');
  await expect(page.getByText('Museum, Hall "A"')).toBeVisible();
  await expect(page.getByText('Saturday, March 1, 2025')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Browse your exported Google Timeline' })).toBeFocused();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'How Field Atlas handles your data' })).toBeFocused();
  await page.goBack();
  await expect(page.locator('.archive-meta')).toContainText('semantic.json');

  await page.getByLabel('Primary').getByRole('link', { name: 'Demo' }).click();
  await expect(page.locator('.archive-meta')).toContainText('Sample Timeline JSON');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.locator('.archive-meta')).toContainText('semantic.json');
  await expect(page.getByText('Museum, Hall "A"')).toBeVisible();
});

test('routes set titles, focus headings, and render a designed unknown route', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Primary').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveTitle('Privacy — Field Atlas');
  await expect(page.getByRole('heading', { name: 'How Field Atlas handles your data' })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Browse your exported Google Timeline' })).toBeFocused();
  await page.goto('/not-a-real-page');
  await expect(page).toHaveTitle('Page not found — Field Atlas');
  await expect(page.getByRole('heading', { name: 'This Field Atlas page does not exist' })).toBeVisible();
});

test('ships crawl files and route metadata', async ({ page, request }) => {
  const descriptions: Record<string, string> = {
    '/': 'Browse an exported Google Timeline privately in your browser.',
    '/demo': 'Explore a sample Google Timeline in Field Atlas.',
    '/privacy': 'Learn how Field Atlas stores Timeline JSON and optional map tiles.',
    '/terms': 'Read the terms for using Field Atlas with your Timeline JSON.'
  };
  for (const route of [...Object.keys(descriptions), '/?demo=1']) {
    await page.goto(route);
    const expectedRoute = route === '/?demo=1' ? '/demo' : route;
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', new RegExp(expectedRoute === '/' ? '/$' : `${expectedRoute}$`));
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', route === '/?demo=1' ? descriptions['/demo'] : descriptions[route]);
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /social-card\.png/);
  }
  const robots = await request.get('/robots.txt'), sitemap = await request.get('/sitemap.xml');
  expect(robots.headers()['content-type']).toContain('text/plain');
  expect(await sitemap.text()).toContain('<urlset');
});

test('the static 404 includes complete metadata and shared site structure', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Field Atlas');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'The requested Field Atlas page does not exist.');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://timeline-json-viewer.sociobot.in/404');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card\.png/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main');
  await expect(page.getByLabel('Primary').getByRole('link', { name: 'Demo' })).toHaveAttribute('href', '/demo');
  await expect(page.getByRole('contentinfo')).toContainText('Field Atlas reads Timeline JSON in your browser.');
  await expect(page.getByRole('contentinfo')).toContainText('Version 1.0.0');
  await expect(page.getByRole('contentinfo')).toContainText('Built by Param Factory');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
});
