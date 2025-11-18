const { test, expect } = require('@playwright/test');

/**
 * FM-SC-004: Form Validation with Invalid Data
 *
 * This test verifies that form validation works correctly when users
 * submit invalid or incomplete data.
 */

test.describe('FM-SC-004: Form Validation with Invalid Data', () => {

  let formUrl;

  test.beforeEach(async ({ page }) => {
    // Setup: Create a form with validation rules
    await page.goto('/sign-in');
    await page.fill('input[name="user[email]"]', 'admin@example.com');
    await page.fill('input[name="user[password]"]', 'SampleAdmin123!');
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');

    // Wait for authentication to complete
    await page.waitForLoadState('networkidle');



    // Navigate to forms page
    await page.goto("/forms");
    await page.waitForLoadState('networkidle');

    await page.goto('/forms/new');
    await page.fill('[data-testid="form-name-input"]', 'Validation Test Form');
    await page.fill('[data-testid="form-description-input"]', 'Form for testing validation');

    // Add fields with validation
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

    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');

    await page.click('[data-testid="view-form-link"]');
    formUrl = page.url();

    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
  });

  test('Test Case 1: should show errors when all required fields are empty', async ({ page }) => {
    await page.goto(formUrl);

    // Try to submit without filling any fields
    await page.click('[data-testid="submit-form-button"]');

    // Verify validation errors appear for all required fields
    await expect(page.locator('[data-testid="error-full-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-full-name"]')).toContainText('This field is required');

    await expect(page.locator('[data-testid="error-email-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-email-address"]')).toContainText('This field is required');

    await expect(page.locator('[data-testid="error-product-category"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-product-category"]')).toContainText('This field is required');

    await expect(page.locator('[data-testid="error-feedback-comments"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-feedback-comments"]')).toContainText('This field is required');

    await expect(page.locator('[data-testid="error-rating-1-10"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-rating-1-10"]')).toContainText('This field is required');

    // Verify form was not submitted
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible();
  });

  test('Test Case 2: should show error for invalid email format', async ({ page }) => {
    await page.goto(formUrl);

    // Fill in name but invalid email
    await page.fill('[data-testid="input-full-name"]', 'Jane Doe');
    await page.fill('[data-testid="input-email-address"]', 'invalidemail');

    // Try to submit
    await page.click('[data-testid="submit-form-button"]');

    // Verify email validation error
    await expect(page.locator('[data-testid="error-email-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-email-address"]')).toContainText(
      /Please enter a valid email address|Invalid email format/i
    );

    // Verify form was not submitted
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible();
  });

  test('Test Case 3: should show error for textarea below minimum length', async ({ page }) => {
    await page.goto(formUrl);

    // Fill in all fields but short textarea
    await page.fill('[data-testid="input-full-name"]', 'Jane Doe');
    await page.fill('[data-testid="input-email-address"]', 'jane@example.com');
    await page.click('[data-testid="select-product-category"]');
    await page.click('[data-testid="option-clothing"]');
    await page.fill('[data-testid="textarea-feedback-comments"]', 'Good'); // Only 4 characters
    await page.fill('[data-testid="input-rating-1-10"]', '8');

    // Try to submit
    await page.click('[data-testid="submit-form-button"]');

    // Verify minimum length validation error
    await expect(page.locator('[data-testid="error-feedback-comments"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-feedback-comments"]')).toContainText(
      /Minimum 10 characters required|Must be at least 10 characters/i
    );

    // Verify form was not submitted
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible();
  });

  test('Test Case 4: should show error for number above maximum range', async ({ page }) => {
    await page.goto(formUrl);

    // Fill in all fields correctly except rating (too high)
    await page.fill('[data-testid="input-full-name"]', 'Jane Doe');
    await page.fill('[data-testid="input-email-address"]', 'jane@example.com');
    await page.click('[data-testid="select-product-category"]');
    await page.click('[data-testid="option-clothing"]');
    await page.fill('[data-testid="textarea-feedback-comments"]', 'Great quality and fast shipping!');
    await page.fill('[data-testid="input-rating-1-10"]', '15'); // Above maximum

    // Try to submit
    await page.click('[data-testid="submit-form-button"]');

    // Verify range validation error
    await expect(page.locator('[data-testid="error-rating-1-10"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-rating-1-10"]')).toContainText(
      /Value must be between 1 and 10|Maximum value is 10/i
    );

    // Verify form was not submitted
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible();
  });

  test('Test Case 5: should show error for number below minimum range', async ({ page }) => {
    await page.goto(formUrl);

    // Fill in all fields correctly except rating (too low)
    await page.fill('[data-testid="input-full-name"]', 'Jane Doe');
    await page.fill('[data-testid="input-email-address"]', 'jane@example.com');
    await page.click('[data-testid="select-product-category"]');
    await page.click('[data-testid="option-clothing"]');
    await page.fill('[data-testid="textarea-feedback-comments"]', 'Great quality and fast shipping!');
    await page.fill('[data-testid="input-rating-1-10"]', '0'); // Below minimum

    // Try to submit
    await page.click('[data-testid="submit-form-button"]');

    // Verify range validation error
    await expect(page.locator('[data-testid="error-rating-1-10"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-rating-1-10"]')).toContainText(
      /Value must be between 1 and 10|Minimum value is 1/i
    );

    // Verify form was not submitted
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible();
  });

  test('should successfully submit after correcting all validation errors', async ({ page }) => {
    await page.goto(formUrl);

    // First try with invalid data
    await page.fill('[data-testid="input-email-address"]', 'invalidemail');
    await page.click('[data-testid="submit-form-button"]');

    // Verify error appears
    await expect(page.locator('[data-testid="error-email-address"]')).toBeVisible();

    // Correct all fields
    await page.fill('[data-testid="input-full-name"]', 'Jane Doe');
    await page.fill('[data-testid="input-email-address"]', 'jane@example.com');
    await page.click('[data-testid="select-product-category"]');
    await page.click('[data-testid="option-clothing"]');
    await page.fill('[data-testid="textarea-feedback-comments"]', 'Great quality and fast shipping!');
    await page.fill('[data-testid="input-rating-1-10"]', '9');

    // Submit again
    await page.click('[data-testid="submit-form-button"]');

    // Verify successful submission
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Form submitted successfully');
  });

  test('should clear error messages when fields are corrected', async ({ page }) => {
    await page.goto(formUrl);

    // Submit empty form to trigger errors
    await page.click('[data-testid="submit-form-button"]');
    await expect(page.locator('[data-testid="error-full-name"]')).toBeVisible();

    // Fill in the field
    await page.fill('[data-testid="input-full-name"]', 'John Smith');

    // Error should disappear (may require blur event)
    await page.click('[data-testid="input-email-address"]'); // Click another field to trigger blur

    // Verify error is cleared
    await expect(page.locator('[data-testid="error-full-name"]')).not.toBeVisible();
  });

});
