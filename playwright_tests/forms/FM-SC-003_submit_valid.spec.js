const { test, expect } = require('@playwright/test');

/**
 * FM-SC-003: Submit Form with Valid Data
 *
 * This test verifies that a user can fill out a form with valid data
 * and submit it successfully.
 */

test.describe('FM-SC-003: Submit Form with Valid Data', () => {

  let formUrl;

  test.beforeEach(async ({ page }) => {
    // Login as admin to create a test form
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Create a form with configured fields
    await page.goto('/forms/new');
    await page.fill('[data-testid="form-name-input"]', 'Customer Feedback Form');
    await page.fill('[data-testid="form-description-input"]', 'Collect customer feedback');

    // Add fields (reusing field configuration logic)
    const fields = [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email Address', required: true },
      { type: 'dropdown', label: 'Product Category', required: true, options: ['Electronics', 'Clothing', 'Home & Garden'] },
      { type: 'textarea', label: 'Feedback Comments', required: true, minLength: '10' },
      { type: 'number', label: 'Rating (1-10)', required: true, min: '1', max: '10' }
    ];

    for (const fieldConfig of fields) {
      await page.click('[data-testid="add-field-button"]');
      await page.click(`[data-testid="field-type-${fieldConfig.type}"]`);
      await page.fill('[data-testid="field-label-input"]', fieldConfig.label);

      if (fieldConfig.required) {
        await page.click('[data-testid="field-required-checkbox"]');
      }

      if (fieldConfig.options) {
        for (let i = 0; i < fieldConfig.options.length; i++) {
          await page.fill(`[data-testid="option-input-${i + 1}"]`, fieldConfig.options[i]);
          if (i < fieldConfig.options.length - 1) {
            await page.click('[data-testid="add-option-button"]');
          }
        }
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
    }

    // Set form to Active status
    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');

    // Get the form submission URL
    await page.click('[data-testid="view-form-link"]');
    formUrl = page.url();

    // Logout to test as regular user
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
  });

  test('should submit form with all valid data', async ({ page }) => {
    // Step 1: Navigate to form submission page
    await page.goto(formUrl);

    // Step 2: Verify all fields are displayed
    await expect(page.locator('[data-testid="form-field-full-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-field-email-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-field-product-category"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-field-feedback-comments"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-field-rating-1-10"]')).toBeVisible();

    // Step 3: Fill in Full Name
    await page.fill('[data-testid="input-full-name"]', 'John Smith');

    // Step 4: Fill in Email Address
    await page.fill('[data-testid="input-email-address"]', 'john.smith@example.com');

    // Step 5: Select Product Category
    await page.click('[data-testid="select-product-category"]');
    await page.click('[data-testid="option-electronics"]');

    // Step 6: Fill in Feedback Comments
    await page.fill(
      '[data-testid="textarea-feedback-comments"]',
      'The product quality is excellent and exceeded my expectations.'
    );

    // Step 7: Enter Rating
    await page.fill('[data-testid="input-rating-1-10"]', '8');

    // Step 9: Click Submit button
    await page.click('[data-testid="submit-form-button"]');

    // Step 10: Verify success confirmation message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Form submitted successfully'
    );

    // Verify submission appears in the system (login as admin)
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.goto('/forms/submissions');
    const submission = page.locator('[data-testid="submission-row"]').first();
    await expect(submission).toContainText('John Smith');
    await expect(submission).toContainText('john.smith@example.com');
  });

  test('should display all form fields correctly before submission', async ({ page }) => {
    await page.goto(formUrl);

    // Verify form title and description
    await expect(page.locator('[data-testid="form-title"]')).toContainText('Customer Feedback Form');
    await expect(page.locator('[data-testid="form-description"]')).toContainText('Collect customer feedback');

    // Verify all field labels
    await expect(page.locator('label', { hasText: 'Full Name' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Email Address' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Product Category' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Feedback Comments' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Rating (1-10)' })).toBeVisible();

    // Verify required indicators
    await expect(page.locator('[data-testid="required-indicator"]')).toHaveCount(5);
  });

  test('should submit multiple times if allowed', async ({ page }) => {
    await page.goto(formUrl);

    // First submission
    await page.fill('[data-testid="input-full-name"]', 'Alice Johnson');
    await page.fill('[data-testid="input-email-address"]', 'alice@example.com');
    await page.click('[data-testid="select-product-category"]');
    await page.click('[data-testid="option-clothing"]');
    await page.fill('[data-testid="textarea-feedback-comments"]', 'Great service and fast delivery!');
    await page.fill('[data-testid="input-rating-1-10"]', '9');
    await page.click('[data-testid="submit-form-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Check if form allows multiple submissions
    const submitAnotherButton = page.locator('[data-testid="submit-another-response-button"]');
    if (await submitAnotherButton.isVisible()) {
      await submitAnotherButton.click();

      // Second submission
      await page.fill('[data-testid="input-full-name"]', 'Bob Wilson');
      await page.fill('[data-testid="input-email-address"]', 'bob@example.com');
      await page.click('[data-testid="select-product-category"]');
      await page.click('[data-testid="option-home-garden"]');
      await page.fill('[data-testid="textarea-feedback-comments"]', 'Product arrived in perfect condition.');
      await page.fill('[data-testid="input-rating-1-10"]', '10');
      await page.click('[data-testid="submit-form-button"]');

      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    }
  });

});
