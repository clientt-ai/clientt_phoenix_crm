const { test, expect } = require('@playwright/test');

/**
 * FM-SC-006: Edit Existing Form
 *
 * This test verifies that users can edit an existing form's basic information
 * and field configuration, then save the changes successfully.
 */

test.describe('FM-SC-006: Edit Existing Form', () => {

  let formId;
  let formUrl;

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Create a test form to edit
    await page.goto('/forms/new');
    await page.fill('[data-testid="form-name-input"]', 'Customer Feedback Form');
    await page.fill('[data-testid="form-description-input"]', 'Collect customer feedback on product experience');
    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-draft"]');

    // Add initial fields
    const fields = [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email Address', required: true },
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

    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();

    // Extract form ID/URL
    formUrl = page.url();
    const match = formUrl.match(/forms\/([a-zA-Z0-9-]+)/);
    if (match) {
      formId = match[1];
    }
  });

  test('should load form edit page with pre-filled data', async ({ page }) => {
    // Step 1-2: Navigate to forms listing and locate form
    await page.goto('/forms');
    const formCard = page.locator('[data-testid="form-card"]', { hasText: 'Customer Feedback Form' });

    // Step 3: Click Edit button
    await formCard.locator('[data-testid="edit-form-button"]').click();

    // Step 4: Verify form edit page loads with current data
    await expect(page).toHaveURL(/.*forms\/.*\/edit|forms\/.*$/);
    await expect(page.locator('[data-testid="form-name-input"]')).toHaveValue('Customer Feedback Form');
    await expect(page.locator('[data-testid="form-description-input"]')).toHaveValue(
      'Collect customer feedback on product experience'
    );
  });

  test('should edit basic form information', async ({ page }) => {
    await page.goto(formUrl);

    // Step 5: Edit basic form information
    await page.fill('[data-testid="form-name-input"]', 'Customer Feedback Survey');
    await page.fill(
      '[data-testid="form-description-input"]',
      'Comprehensive customer feedback and satisfaction survey'
    );
    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');

    // Step 11: Save changes
    await page.click('[data-testid="save-form-button"]');

    // Step 12: Verify success message
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-notification"]')).toContainText(
      /Form updated successfully|Changes saved/i
    );

    // Step 13-14: Verify changes in listing
    await page.goto('/forms');
    const formCard = page.locator('[data-testid="form-card"]', { hasText: 'Customer Feedback Survey' });
    await expect(formCard).toBeVisible();
    await expect(formCard.locator('[data-testid="form-status"]')).toContainText('Active');

    // Step 15: Verify changes persisted
    await formCard.click();
    await expect(page.locator('[data-testid="form-name-input"]')).toHaveValue('Customer Feedback Survey');
    await expect(page.locator('[data-testid="form-description-input"]')).toHaveValue(
      'Comprehensive customer feedback and satisfaction survey'
    );
  });

  test('should edit existing form field', async ({ page }) => {
    await page.goto(formUrl);

    // Step 6: Edit form fields - click on existing field
    const fullNameField = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await fullNameField.click();

    // Open field editor
    await fullNameField.locator('[data-testid="edit-field-button"]').click();

    // Change label
    await page.fill('[data-testid="field-label-input"]', 'Customer Name');

    // Update help text/placeholder
    await page.fill('[data-testid="field-placeholder-input"]', 'Enter your full name');

    // Save field changes
    await page.click('[data-testid="save-field-button"]');

    // Verify field updated
    const updatedField = page.locator('[data-testid="form-field"]', { hasText: 'Customer Name' });
    await expect(updatedField).toBeVisible();

    // Save form
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
  });

  test('should remove a field from the form', async ({ page }) => {
    await page.goto(formUrl);

    // Step 7: Remove a field
    const ratingField = page.locator('[data-testid="form-field"]', { hasText: 'Rating (1-10)' });

    // Click delete button
    await ratingField.locator('[data-testid="delete-field-button"]').click();

    // Confirm deletion
    await page.click('[data-testid="confirm-delete-field-button"]');

    // Verify field is removed
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Rating (1-10)' })).not.toBeVisible();

    // Save form
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();

    // Reload and verify field is still gone
    await page.reload();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Rating (1-10)' })).not.toBeVisible();
  });

  test('should add a new field to existing form', async ({ page }) => {
    await page.goto(formUrl);

    // Step 8: Add a new field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-checkbox"]');

    // Configure new field
    await page.fill('[data-testid="field-label-input"]', 'Subscribe to Newsletter');
    // Leave as optional (don't check required)

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Verify new field appears
    const newField = page.locator('[data-testid="form-field"]', { hasText: 'Subscribe to Newsletter' });
    await expect(newField).toBeVisible();

    // Verify it's marked as optional
    await expect(newField.locator('[data-testid="field-required-badge"]')).not.toBeVisible();

    // Save form
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
  });

  test('should reorder form fields', async ({ page }) => {
    await page.goto(formUrl);

    // Step 9: Reorder fields (if drag-and-drop is available)
    const emailField = page.locator('[data-testid="form-field"]', { hasText: 'Email Address' });
    const fullNameField = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });

    // Check if drag handle exists
    const dragHandle = emailField.locator('[data-testid="drag-handle"]');

    if (await dragHandle.isVisible()) {
      // Perform drag and drop
      await dragHandle.dragTo(fullNameField, { sourcePosition: { x: 10, y: 10 } });

      // Or use alternative reorder buttons if available
      const moveUpButton = emailField.locator('[data-testid="move-up-button"]');
      if (await moveUpButton.isVisible()) {
        await moveUpButton.click();
      }

      // Save form
      await page.click('[data-testid="save-form-button"]');
      await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
    }
  });

  test('should perform complete form edit workflow', async ({ page }) => {
    await page.goto('/forms');

    // Navigate to edit
    const formCard = page.locator('[data-testid="form-card"]', { hasText: 'Customer Feedback Form' });
    await formCard.locator('[data-testid="edit-form-button"]').click();

    // Edit form name and description
    await page.fill('[data-testid="form-name-input"]', 'Customer Feedback Survey');
    await page.fill(
      '[data-testid="form-description-input"]',
      'Comprehensive customer feedback and satisfaction survey'
    );
    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');

    // Edit a field
    const fullNameField = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' }).first();
    await fullNameField.locator('[data-testid="edit-field-button"]').click();
    await page.fill('[data-testid="field-label-input"]', 'Customer Name');
    await page.click('[data-testid="save-field-button"]');

    // Remove a field
    const ratingField = page.locator('[data-testid="form-field"]', { hasText: 'Rating (1-10)' });
    await ratingField.locator('[data-testid="delete-field-button"]').click();
    await page.click('[data-testid="confirm-delete-field-button"]');

    // Add a new field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-checkbox"]');
    await page.fill('[data-testid="field-label-input"]', 'Subscribe to Newsletter');
    await page.click('[data-testid="save-field-button"]');

    // Save all changes
    await page.click('[data-testid="save-form-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();

    // Verify in listing
    await page.goto('/forms');
    await expect(page.locator('[data-testid="form-card"]', { hasText: 'Customer Feedback Survey' })).toBeVisible();
  });

  test('should maintain form ID when editing name', async ({ page }) => {
    const originalUrl = formUrl;

    await page.goto(formUrl);

    // Change form name
    await page.fill('[data-testid="form-name-input"]', 'Renamed Form');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();

    // Verify URL/ID remains the same
    const newUrl = page.url();
    expect(newUrl).toContain(formId);
  });

});
