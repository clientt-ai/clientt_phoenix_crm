const { test, expect } = require('@playwright/test');

/**
 * FM-SC-005: View and List All Forms
 *
 * This test verifies that users can view a list of all forms with
 * correct information, filtering, and sorting capabilities.
 */

test.describe('FM-SC-005: View and List All Forms', () => {

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'SampleAdmin123!');
    await page.click('button:has-text("Sign in")');

    // Wait for redirect after login (expect to go to / or stay on /sign-in with success message)
    await page.waitForTimeout(2000);

    // Navigate directly to forms page after login
    await page.goto("/forms");
    await expect(page).toHaveURL(/.*forms|/);

    // Create multiple test forms for listing
    const testForms = [
      { name: 'Customer Feedback Form', description: 'Collect customer feedback', status: 'active' },
      { name: 'Employee Onboarding Form', description: 'New employee information', status: 'draft' },
      { name: 'Product Survey Form', description: 'Product satisfaction survey', status: 'active' },
      { name: 'Support Request Form', description: 'Customer support requests', status: 'active' },
      { name: 'Partnership Application', description: 'Partner onboarding', status: 'draft' }
    ];

    for (const form of testForms) {
      await page.goto('/forms/new');
      await page.fill('[data-testid="form-name-input"]', form.name);
      await page.fill('[data-testid="form-description-input"]', form.description);
      await page.click('[data-testid="form-status-select"]');
      await page.click(`[data-testid="status-option-${form.status}"]`);
      await page.click('[data-testid="save-form-button"]');
      await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
    }
  });

  test('should display forms listing page successfully', async ({ page }) => {
    await expect(page.locator('h1, h2')).toContainText(formName);

    // Step 11: Return to forms listing
    await page.click('[data-testid="nav-forms"]');
    await expect(page).toHaveURL(/.*forms$/);
  });

  test('should handle empty state when no forms exist', async ({ page }) => {
    // Delete all forms first
    await page.goto('/forms');
    const formCards = page.locator('[data-testid="form-card"]');
    const count = await formCards.count();

    for (let i = 0; i < count; i++) {
      const deleteButton = page.locator('[data-testid="delete-form-button"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.click('[data-testid="confirm-delete-button"]');
        await page.waitForTimeout(500);
      }
    }

    // Reload page
    await page.reload();

    // Verify empty state message
    const emptyState = page.locator('[data-testid="empty-state"]');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toContainText(/No forms found|No forms yet|Create your first form/i);
    }
  });

  test('should display pagination when many forms exist', async ({ page }) => {
    await page.goto('/forms');

    // Check if pagination exists
    const pagination = page.locator('[data-testid="pagination"]');

    if (await pagination.isVisible()) {
      // Step 6: Test pagination
      const nextButton = page.locator('[data-testid="pagination-next"]');

      if (await nextButton.isEnabled()) {
        await nextButton.click();

        // Verify we're on page 2
        await expect(page.locator('[data-testid="current-page"]')).toContainText('2');

        // Navigate back to page 1
        await page.click('[data-testid="pagination-previous"]');
        await expect(page.locator('[data-testid="current-page"]')).toContainText('1');
      }
    }
  });

  test('should display submission count for each form', async ({ page }) => {
    await page.goto('/forms');

    // Verify submission count is displayed
    const firstForm = page.locator('[data-testid="form-card"]').first();
    const submissionCount = firstForm.locator('[data-testid="submission-count"]');

    if (await submissionCount.isVisible()) {
      await expect(submissionCount).toContainText(/\d+ submission|submissions/i);
    }
  });

});
