// @ts-check
const { test, expect } = require('@playwright/test');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:4002';

// Generate unique test user for this run
const timestamp = Date.now();
const TEST_USER_EMAIL = `screenshot_test_${timestamp}@example.com`;
const TEST_USER_PASSWORD = 'SecurePassword123!';

// Run tests serially to share state
test.describe.configure({ mode: 'serial' });

test.describe('Screenshot Capture - Major Screens', () => {

  test('01 - Sign In Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'screenshots/01-sign-in-page.png',
      fullPage: true
    });
  });

  test('02 - Registration Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'screenshots/02-registration-page.png',
      fullPage: true
    });
  });

  test('03 - Home Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'screenshots/03-home-page.png',
      fullPage: true
    });
  });

  test('04 - Password Reset Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/password-reset`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'screenshots/04-password-reset-page.png',
      fullPage: true
    });
  });

  test('05 - Register and Capture Forms Listing', async ({ page }) => {
    // Register a new user
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Use visible inputs - the registration form is the one with password_confirmation
    const confirmInput = page.locator('input[name="user[password_confirmation]"]');
    await confirmInput.waitFor({ state: 'visible' });

    // Find email and password in the same form section
    await page.locator('input[name="user[email]"]:visible').first().fill(TEST_USER_EMAIL);
    await page.locator('input[name="user[password]"]:visible').first().fill(TEST_USER_PASSWORD);
    await confirmInput.fill(TEST_USER_PASSWORD);

    await page.click('button[type="submit"]:has-text("Register")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate to forms
    await page.goto(`${BASE_URL}/forms`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/05-forms-listing-page.png',
      fullPage: true
    });
  });

  test('06 - Form Builder (New Form)', async ({ page }) => {
    // Login with the user we just created
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.locator('input[name="user[email]"]:visible').first().fill(TEST_USER_EMAIL);
    await page.locator('input[name="user[password]"]:visible').first().fill(TEST_USER_PASSWORD);

    await page.click('button[type="submit"]:has-text("Sign in")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Go to new form
    await page.goto(`${BASE_URL}/forms/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'screenshots/06-form-builder-new.png',
      fullPage: true
    });
  });

  test('07 - Form Builder with Created Form', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.locator('input[name="user[email]"]:visible').first().fill(TEST_USER_EMAIL);
    await page.locator('input[name="user[password]"]:visible').first().fill(TEST_USER_PASSWORD);
    await page.click('button[type="submit"]:has-text("Sign in")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Create a form
    await page.goto(`${BASE_URL}/forms/new`);
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
      path: 'screenshots/07-form-builder-created.png',
      fullPage: true
    });
  });

  test('08 - Form with Fields Added', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.locator('input[name="user[email]"]:visible').first().fill(TEST_USER_EMAIL);
    await page.locator('input[name="user[password]"]:visible').first().fill(TEST_USER_PASSWORD);
    await page.click('button[type="submit"]:has-text("Sign in")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Create a form with fields
    await page.goto(`${BASE_URL}/forms/new`);
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

        const fieldTypeSelect = page.locator('[data-testid="field-type-select"]');
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
      path: 'screenshots/08-form-with-fields.png',
      fullPage: true
    });
  });

});
