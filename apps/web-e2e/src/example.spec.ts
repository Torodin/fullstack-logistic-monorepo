import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect h1 to contain a substring.
  expect(await page.locator('h1').innerText()).toContain('Welcome');
});

test('reach api', async ({ page }) => {
  const req = await page.request.get('/api');

  expect(req.ok()).toBeTruthy();;
});
