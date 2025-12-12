import { test, expect } from '@playwright/test';

test.describe('Report Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow anonymous report submission', async ({ page }) => {
    // Navigate to report form
    await page.click('text=Reportar Caso');
    
    // Fill in the form
    await page.fill('[name="description"]', 'Test bullying report');
    await page.selectOption('[name="severity"]', 'high');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=Reporte enviado')).toBeVisible();
  });

  test('should require authentication for admin panel', async ({ page }) => {
    await page.goto('/#/admin');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display cases in admin panel after login', async ({ page }) => {
    // Login as admin
    await page.goto('/#/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.click('button[type="submit"]');
    
    // Navigate to admin panel
    await page.goto('/#/admin');
    
    // Verify cases are displayed
    await expect(page.locator('[data-testid="cases-list"]')).toBeVisible();
  });
});
