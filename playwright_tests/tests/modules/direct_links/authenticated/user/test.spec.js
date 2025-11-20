// @ts-check
const { test, expect } = require('@playwright/test');
const { createScreenshotHelper } = require('../../../../../screenshot-config');

/**
 * Direct Links - User Role Screenshots
 *
 * This test captures screenshots of all pages when logged in as a regular user.
 * Tests both light and dark mode for each page.
 */

test.describe('Direct Links - User Role', () => {
  test.describe.configure({ mode: 'serial' });

  const screenshot = createScreenshotHelper(__dirname);
  const USER_EMAIL = 'sample_user@clientt.com';
  const USER_PASSWORD = 'Hang123!';

  /**
   * Helper function to capture both light and dark mode screenshots
   */
  async function captureThemeScreenshots(page, name) {
    // Take light mode screenshot
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await page.waitForTimeout(300);
    await screenshot(page, `${name}-light`);

    // Take dark mode screenshot
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(300);
    await screenshot(page, `${name}-dark`);

    // Reset to light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
  }

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="user[email]"]', USER_EMAIL);
    await page.fill('input[name="user[password]"]', USER_PASSWORD);
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('01 - Dashboard Page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await captureThemeScreenshots(page, '01-dashboard-page');
  });

  test('02 - Forms Listing Page', async ({ page }) => {
    await page.goto('/forms');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await captureThemeScreenshots(page, '02-forms-listing');
  });

  test('03 - Form Builder Page (New Form)', async ({ page }) => {
    await page.goto('/forms/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await captureThemeScreenshots(page, '03-form-builder-new');
  });

  test('04 - Dashboard with Sidebar Collapsed', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Toggle sidebar (look for hamburger/menu button)
    const toggleBtn = page.locator('button[aria-label*="menu" i], button[aria-label*="toggle" i]').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(300);
    }
    await captureThemeScreenshots(page, '04-dashboard-sidebar-collapsed');
  });
});
