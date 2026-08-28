import { expect, test } from '@playwright/test';

test('first screen names the job and opens the sample in one click', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Browse your exported Google Timeline' })).toBeVisible();
  await expect(page.getByText('For people with a Timeline JSON file they cannot open.')).toBeVisible();
  await page.getByRole('button', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: '2026-08-18, has timeline entries' }).click();
  await expect(page.getByText('Harbor City Museum')).toBeVisible();
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
  for (const route of Object.keys(descriptions)) {
    await page.goto(route);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', new RegExp(route === '/' ? '/$' : route));
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', descriptions[route]);
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /social-card\.png/);
  }
  const robots = await request.get('/robots.txt'), sitemap = await request.get('/sitemap.xml');
  expect(robots.headers()['content-type']).toContain('text/plain');
  expect(await sitemap.text()).toContain('<urlset');
});

test('the static 404 includes complete noindex metadata', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Field Atlas');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'The requested Field Atlas page does not exist.');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://timeline-json-viewer.sociobot.in/404');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card\.png/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png');
});
