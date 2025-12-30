import { test, expect } from '@playwright/test';

test.describe('UPH Core Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
  });

  test('should login successfully with mock credentials', async ({ page }) => {
    // Fill login form
    await page.fill('input[type="email"]', 'demo@adc.com');
    await page.fill('input[type="password"]', 'demo123');
    
    // Click login
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // access project page
    await page.click('a[href="/projects"]');
    
    // check if project page is loaded
    await expect(page.getByText('Projeler')).toBeVisible();

  });

  test('should display dashboard elements after login', async ({ page }) => {
     // Quick login bypass if possible, or repeat login
    await page.fill('input[type="email"]', 'demo@adc.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('Aktif Projeler')).toBeVisible();
    await expect(page.getByText('Tamamlanan Görevler')).toBeVisible();
  });
});
