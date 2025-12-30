import { test, expect } from '@playwright/test';

test.describe('UPH Project Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@adc.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should create a new project', async ({ page }) => {
    // Navigate to projects
    await page.click('a[href="/projects"]');
    
    // Open Create Modal
    await page.click('button:has-text("Yeni Proje")');
    
    // Fill Form
    const testProjectName = `Test Project ${Date.now()}`;
    await page.fill('input[name="name"]', testProjectName);
    await page.fill('textarea[name="description"]', 'E2E Test Description');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify in list
    await expect(page.getByText(testProjectName)).toBeVisible();
  });
});
