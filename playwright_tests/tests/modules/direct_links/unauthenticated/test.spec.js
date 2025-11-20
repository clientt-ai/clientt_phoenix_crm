// @ts-check
const { test, expect } = require('@playwright/test');
const { createScreenshotHelper } = require('../../../../screenshot-config');

/**
 * Direct Links - Unauthenticated Screenshots
 *
 * This test captures screenshots of public pages without authentication.
 * Tests both light and dark mode for each page.
 */

test.describe('Direct Links - Unauthenticated', () => {
  test.describe.configure({ mode: 'serial' });

  const screenshot = createScreenshotHelper(__dirname);

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

  test('01 - Sign In Page', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await captureThemeScreenshots(page, '01-sign-in-page');
  });

  test('02 - Registration Page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await captureThemeScreenshots(page, '02-registration-page');
  });

  test('03 - Password Reset Page', async ({ page }) => {
    await page.goto('/password-reset');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await captureThemeScreenshots(page, '03-password-reset-page');
  });

  test('04 - Home Page (Unauthenticated)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await captureThemeScreenshots(page, '04-home-page-unauth');
  });
});
