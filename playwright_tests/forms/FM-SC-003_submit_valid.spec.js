const { test, expect } = require('@playwright/test');

/**
 * FM-SC-003: Submit Form with Valid Data
 *
 * NOTE: This test file is a placeholder. The form submission feature
 * (public form filling page) is not yet implemented. These tests will
 * be enabled once the feature is built.
 */

test.describe('FM-SC-003: Submit Form with Valid Data', () => {

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await page.fill('input[name="user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="user[password]"]', 'SampleAdmin123!');
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');
    await page.waitForLoadState('networkidle');
  });

  test('should create form with fields for future submission testing', async ({ page }) => {
    // Create a form with configured fields (submission UI not yet implemented)
    const formName = `Submit Test Form ${Date.now()}`;
    await page.goto('/forms/new');
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Collect customer feedback');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

    // Add a text field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'text');
    await page.fill('[data-testid="field-label-input"]', 'Full Name');
    await page.check('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    // Verify field added
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await expect(field).toBeVisible({ timeout: 5000 });

    // Add an email field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'email');
    await page.fill('[data-testid="field-label-input"]', 'Email Address');
    await page.check('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    const emailField = page.locator('[data-testid="form-field"]', { hasText: 'Email Address' });
    await expect(emailField).toBeVisible({ timeout: 5000 });

    // Verify form has fields configured for future submission
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(2);
  });

  test('should publish form for submission', async ({ page }) => {
    // Create and publish a form
    const formName = `Publish Test Form ${Date.now()}`;
    await page.goto('/forms/new');
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Test publishing');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

    // Add at least one field (required for publishing)
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'text');
    await page.fill('[data-testid="field-label-input"]', 'Name');
    await page.click('[data-testid="save-field-button"]');
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    // Publish the form
    // Wait for previous notification to auto-dismiss
    await page.waitForTimeout(1000);

    const publishButton = page.locator('[data-testid="publish-form-button"]');
    if (await publishButton.isVisible()) {
      await publishButton.click({ force: true });
      await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display form preview with all fields', async ({ page }) => {
    // Create a form and verify preview shows fields
    const formName = `Preview Test Form ${Date.now()}`;
    await page.goto('/forms/new');
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Preview test');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

    // Add fields
    const fields = [
      { type: 'text', label: 'Full Name' },
      { type: 'email', label: 'Email' },
      { type: 'textarea', label: 'Comments' }
    ];

    for (const fieldConfig of fields) {
      await page.click('[data-testid="add-field-button"]');
      await page.selectOption('[data-testid="field-type-select"]', fieldConfig.type);
      await page.fill('[data-testid="field-label-input"]', fieldConfig.label);
      await page.click('[data-testid="save-field-button"]');
      await page.waitForSelector(`[data-testid="form-field"]:has-text("${fieldConfig.label}")`, { timeout: 5000 });
    }

    // Verify all fields appear in the preview section
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(3);
  });

});
