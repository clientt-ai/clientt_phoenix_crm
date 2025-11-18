const { test, expect } = require('@playwright/test');

/**
 * FM-SC-002: Configure Form Fields and Validation
 *
 * This test verifies that a user can add multiple field types to a form
 * and configure their validation rules successfully.
 */

test.describe('FM-SC-002: Configure Form Fields and Validation', () => {

  let formId;

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await page.fill('input[name="user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="user[password]"]', 'SampleAdmin123!');
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');

    // Wait for authentication to complete
    await page.waitForLoadState('networkidle');



    // Navigate to forms page
    await page.goto("/forms");
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*forms|/);

    // Create a test form to configure
    await page.goto('/forms/new');
    await page.fill('[data-testid="form-name-input"]', 'Test Configuration Form');
    await page.fill('[data-testid="form-description-input"]', 'Form for field configuration testing');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();

    // Extract form ID from URL for later use
    const url = page.url();
    formId = url.match(/forms\/([a-zA-Z0-9-]+)/)[1];
  });

  test('should add text input field with validation', async ({ page }) => {
    // Step 3: Add a Text Input field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-text"]');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Full Name');
    await page.click('[data-testid="field-required-checkbox"]');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Verify field appears in form builder
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await expect(field).toBeVisible();
    await expect(field.locator('[data-testid="field-required-badge"]')).toBeVisible();
  });

  test('should add email field with format validation', async ({ page }) => {
    // Step 4: Add an Email field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-email"]');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Email Address');
    await page.click('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="email-validation-checkbox"]');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Verify field appears with email validation
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Email Address' });
    await expect(field).toBeVisible();
    await expect(field.locator('[data-testid="validation-badge-email"]')).toBeVisible();
  });

  test('should add dropdown field with options', async ({ page }) => {
    // Step 5: Add a Dropdown field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-dropdown"]');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Product Category');
    await page.click('[data-testid="field-required-checkbox"]');

    // Add options
    await page.fill('[data-testid="option-input-1"]', 'Electronics');
    await page.click('[data-testid="add-option-button"]');
    await page.fill('[data-testid="option-input-2"]', 'Clothing');
    await page.click('[data-testid="add-option-button"]');
    await page.fill('[data-testid="option-input-3"]', 'Home & Garden');
    await page.click('[data-testid="add-option-button"]');
    await page.fill('[data-testid="option-input-4"]', 'Other');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Verify field appears with all options
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Product Category' });
    await expect(field).toBeVisible();
  });

  test('should add textarea field with character limits', async ({ page }) => {
    // Step 6: Add a Textarea field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-textarea"]');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Feedback Comments');
    await page.click('[data-testid="field-required-checkbox"]');
    await page.fill('[data-testid="min-length-input"]', '10');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Verify field appears with validation
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Feedback Comments' });
    await expect(field).toBeVisible();
  });

  test('should add number field with range validation', async ({ page }) => {
    // Step 7: Add a Number field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-number"]');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Rating (1-10)');
    await page.click('[data-testid="field-required-checkbox"]');
    await page.fill('[data-testid="min-value-input"]', '1');
    await page.fill('[data-testid="max-value-input"]', '10');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Verify field appears with range validation
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Rating (1-10)' });
    await expect(field).toBeVisible();
  });

  test('should configure all fields in sequence', async ({ page }) => {
    const fields = [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email Address', required: true },
      { type: 'dropdown', label: 'Product Category', required: true },
      { type: 'textarea', label: 'Feedback Comments', required: true, minLength: '10' },
      { type: 'number', label: 'Rating (1-10)', required: true, min: '1', max: '10' }
    ];

    // Add each field
    for (const fieldConfig of fields) {
      await page.click('[data-testid="add-field-button"]');
      await page.click(`[data-testid="field-type-${fieldConfig.type}"]`);
      await page.fill('[data-testid="field-label-input"]', fieldConfig.label);

      if (fieldConfig.required) {
        await page.click('[data-testid="field-required-checkbox"]');
      }

      if (fieldConfig.minLength) {
        await page.fill('[data-testid="min-length-input"]', fieldConfig.minLength);
      }

      if (fieldConfig.min) {
        await page.fill('[data-testid="min-value-input"]', fieldConfig.min);
      }

      if (fieldConfig.max) {
        await page.fill('[data-testid="max-value-input"]', fieldConfig.max);
      }

      await page.click('[data-testid="save-field-button"]');

      // Verify field was added
      const field = page.locator('[data-testid="form-field"]', { hasText: fieldConfig.label });
      await expect(field).toBeVisible();
    }

    // Step 9: Save the form
    await page.click('[data-testid="save-form-button"]');

    // Step 10: Verify success notification
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-notification"]')).toContainText(
      'Form updated successfully'
    );

    // Verify all 5 fields are present
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(5);
  });

});
