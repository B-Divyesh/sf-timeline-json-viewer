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
  for (const route of ['/', '/demo', '/privacy', '/terms']) {
    await page.goto(route);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', new RegExp(route === '/' ? '/$' : route));
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /social-card\.png/);
  }
  const robots = await request.get('/robots.txt'), sitemap = await request.get('/sitemap.xml');
  expect(robots.headers()['content-type']).toContain('text/plain');
  expect(await sitemap.text()).toContain('<urlset');
});
