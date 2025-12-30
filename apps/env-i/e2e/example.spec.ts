import { test, expect } from '@playwright/test';

test.describe('ENV-I Inventory System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Basic mock login if needed, or check if already logged in
    await page.fill('input[type="email"]', 'demo@adc.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
  });

  test('should display dashboard stats', async ({ page }) => {
    await expect(page.getByText('Toplam Envanter')).toBeVisible();
    await expect(page.getByText('Düşük Stok')).toBeVisible();
  });

  test('should list products in inventory', async ({ page }) => {
    await page.click('a[href="/inventory"]');
    
    // Check for table headers
    await expect(page.getByText('Ürün Adı')).toBeVisible();
    await expect(page.getByText('Stok')).toBeVisible();
    
    // Check for "Yeni Ürün" button existence
    await expect(page.getByRole('button', { name: 'Yeni Ürün' })).toBeVisible();
  });
});
