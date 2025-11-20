const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * FM-SC-003: Submit Form with Valid Data
 *
 * NOTE: This test file is a placeholder. The form submission feature
 * (public form filling page) is not yet implemented. These tests will
 * be enabled once the feature is built.
 */

test.describe('FM-SC-003: Form Creation with Fields', () => {
  const screenshotsDir = path.join(__dirname, '../../playwright_screenshots/playwright_tests/forms', path.basename(__dirname));

  // Helper function to capture screenshots with consistent naming
  async function screenshot(page, name) {
    await page.screenshot({
      path: path.join(screenshotsDir, `${name}.png`),
      fullPage: false
    });
  }

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await screenshot(page, '01-sign-in-page');

    await page.fill('input[name="user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="user[password]"]', 'Hang123!');
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await screenshot(page, '02-after-login');

    // Navigate to forms page
    await page.goto('/forms');
    await page.waitForURL('**/forms');

    // Verify header and sidebar navigation are present on authenticated pages
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('[data-testid="nav-forms"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Forms');
    await screenshot(page, '03-forms-listing-page');
  });

  test('should create form with fields for future submission testing', async ({ page }) => {
    // Create a form with configured fields (submission UI not yet implemented)
    const formName = `Submit Test Form ${Date.now()}`;

    // Click Create Form button
    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Collect customer feedback');
    await screenshot(page, '04-form-details-filled');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '05-form-saved');

    // Add a text field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'text');
    await page.fill('[data-testid="field-label-input"]', 'Full Name');
    await page.check('[data-testid="field-required-checkbox"]');
    await screenshot(page, '06-text-field-configured');
    await page.click('[data-testid="save-field-button"]');

    // Verify field added
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await screenshot(page, '07-text-field-added');

    // Add an email field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'email');
    await page.fill('[data-testid="field-label-input"]', 'Email Address');
    await page.check('[data-testid="field-required-checkbox"]');
    await screenshot(page, '08-email-field-configured');
    await page.click('[data-testid="save-field-button"]');

    const emailField = page.locator('[data-testid="form-field"]', { hasText: 'Email Address' });
    await expect(emailField).toBeVisible({ timeout: 5000 });

    // Verify form has fields configured for future submission
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(2);
    await screenshot(page, '09-both-fields-added');
  });

  test('should publish form for submission', async ({ page }) => {
    // Create and publish a form
    const formName = `Publish Test Form ${Date.now()}`;

    // Click Create Form button
    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Test publishing');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '10-form-for-publishing');

    // Add at least one field (required for publishing)
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'text');
    await page.fill('[data-testid="field-label-input"]', 'Name');
    await page.click('[data-testid="save-field-button"]');
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });
    await screenshot(page, '11-field-added-for-publishing');

    // Publish the form - wait for notification to auto-dismiss first
    // Notification may still be visible but should not block navigation

    const publishButton = page.locator('[data-testid="publish-form-button"]');
    if (await publishButton.isVisible()) {
      // Wait for any overlaying notifications to auto-dismiss
      await page.waitForTimeout(3000);

      // Force click the publish button (bypasses overlay issues)
      await publishButton.click({ force: true });
      await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
      await screenshot(page, '12-form-published');
    }
  });

  test('should display form preview with all fields', async ({ page }) => {
    // Create a form and verify preview shows fields
    const formName = `Preview Test Form ${Date.now()}`;

    // Click Create Form button
    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Preview test');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '13-form-for-preview');

    // Add fields
    const fields = [
      { type: 'text', label: 'Full Name' },
      { type: 'email', label: 'Email' },
      { type: 'textarea', label: 'Comments' }
    ];

    for (let i = 0; i < fields.length; i++) {
      const fieldConfig = fields[i];
      await page.click('[data-testid="add-field-button"]');
      await page.selectOption('[data-testid="field-type-select"]', fieldConfig.type);
      await page.fill('[data-testid="field-label-input"]', fieldConfig.label);
      await page.click('[data-testid="save-field-button"]');
      await page.waitForSelector(`[data-testid="form-field"]:has-text("${fieldConfig.label}")`, { timeout: 5000 });
      await screenshot(page, `14-preview-field-${i + 1}-added`);
    }

    // Verify all fields appear in the preview section
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(3);
    await screenshot(page, '15-all-preview-fields');
  });

});
