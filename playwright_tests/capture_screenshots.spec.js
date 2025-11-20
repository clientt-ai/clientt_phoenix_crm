// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:4002';
const screenshotsDir = path.join(__dirname, '../playwright_screenshots/playwright_tests/navigation');

// Use seed admin user (no email confirmation required)
const TEST_USER_EMAIL = 'sample_admin@clientt.com';
const TEST_USER_PASSWORD = 'Hang123!';

// Run tests serially to share state
test.describe.configure({ mode: 'serial' });

test.describe('Screenshot Capture - Major Screens', () => {

  test('01 - Sign In Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(screenshotsDir, '01-sign-in-page.png'),
      fullPage: false
    });
  });

  test('02 - Registration Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(screenshotsDir, '02-registration-page.png'),
      fullPage: false
    });
  });

  test('03 - Home Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(screenshotsDir, '03-home-page.png'),
      fullPage: false
    });
  });

  test('04 - Password Reset Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/password-reset`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(screenshotsDir, '04-password-reset-page.png'),
      fullPage: false
    });
  });

  test('05 - Login and Capture Forms Listing', async ({ page }) => {
    // Login with seed admin user
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.locator('input[name="user[email]"]:visible').first().fill(TEST_USER_EMAIL);
    await page.locator('input[name="user[password]"]:visible').first().fill(TEST_USER_PASSWORD);

    await page.click('button[type="submit"]:has-text("Sign in")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Navigate to forms with longer timeout
    await page.goto(`${BASE_URL}/forms`, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(screenshotsDir, '05-forms-listing-page.png'),
      fullPage: false
    });
  });

  test('06 - Form Builder (New Form)', async ({ page }) => {
    // Login with seed admin user
    await page.goto(`${BASE_URL}/sign-in`, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.locator('input[name="user[email]"]:visible').first().fill(TEST_USER_EMAIL);
    await page.locator('input[name="user[password]"]:visible').first().fill(TEST_USER_PASSWORD);

    await page.click('button[type="submit"]:has-text("Sign in")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Go to new form
    await page.goto(`${BASE_URL}/forms/new`, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(screenshotsDir, '06-form-builder-new.png'),
      fullPage: false
    });
  });

  test('07 - Form Builder with Created Form', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/sign-in`, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.locator('input[name="user[email]"]:visible').first().fill(TEST_USER_EMAIL);
    await page.locator('input[name="user[password]"]:visible').first().fill(TEST_USER_PASSWORD);
    await page.click('button[type="submit"]:has-text("Sign in")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Create a form
    await page.goto(`${BASE_URL}/forms/new`, { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    const formNameInput = page.locator('[data-testid="form-name-input"]');
    if (await formNameInput.isVisible({ timeout: 5000 })) {
      await formNameInput.fill(`Screenshot Test Form ${Date.now()}`);

      const descInput = page.locator('[data-testid="form-description-input"]');
      if (await descInput.isVisible()) {
        await descInput.fill('Test form for screenshots');
      }

      const categorySelect = page.locator('[data-testid="form-category-select"]');
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption('general');
      }

      const statusSelect = page.locator('[data-testid="form-status-select"]');
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('draft');
      }

      const saveButton = page.locator('[data-testid="save-form-button"]');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(1000);
      }
    }

    await page.screenshot({
      path: path.join(screenshotsDir, '07-form-builder-created.png'),
      fullPage: false
    });
  });

  test('08 - Form with Fields Added', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/sign-in`, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.locator('input[name="user[email]"]:visible').first().fill(TEST_USER_EMAIL);
    await page.locator('input[name="user[password]"]:visible').first().fill(TEST_USER_PASSWORD);
    await page.click('button[type="submit"]:has-text("Sign in")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Create a form with fields
    await page.goto(`${BASE_URL}/forms/new`, { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    const formNameInput = page.locator('[data-testid="form-name-input"]');
    if (await formNameInput.isVisible({ timeout: 5000 })) {
      await formNameInput.fill(`Fields Test Form ${Date.now()}`);

      const descInput = page.locator('[data-testid="form-description-input"]');
      if (await descInput.isVisible()) await descInput.fill('Form with fields');

      const categorySelect = page.locator('[data-testid="form-category-select"]');
      if (await categorySelect.isVisible()) await categorySelect.selectOption('general');

      const statusSelect = page.locator('[data-testid="form-status-select"]');
      if (await statusSelect.isVisible()) await statusSelect.selectOption('draft');

      const saveButton = page.locator('[data-testid="save-form-button"]');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(1000);
      }

      // Try to add a field
      const addFieldBtn = page.locator('[data-testid="add-field-button"]');
      if (await addFieldBtn.isVisible({ timeout: 3000 })) {
        await addFieldBtn.click();
        await page.waitForTimeout(500);

        const fieldTypeSelect = page.locator('select[data-testid="field-type-select"]');
        if (await fieldTypeSelect.isVisible()) {
          await fieldTypeSelect.selectOption('text');
        }

        const fieldLabelInput = page.locator('[data-testid="field-label-input"]');
        if (await fieldLabelInput.isVisible()) {
          await fieldLabelInput.fill('Full Name');
        }

        const saveFieldBtn = page.locator('[data-testid="save-field-button"]');
        if (await saveFieldBtn.isVisible()) {
          await saveFieldBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }

    await page.screenshot({
      path: path.join(screenshotsDir, '08-form-with-fields.png'),
      fullPage: false
    });
  });

});
