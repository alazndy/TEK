import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Unified Project Hub|T-HUB/);
});

test('navigate to projects', async ({ page }) => {
  await page.goto('/');
  // Basic navigation check
  await expect(page).toHaveURL(/.*dashboard|.*login/);
});
