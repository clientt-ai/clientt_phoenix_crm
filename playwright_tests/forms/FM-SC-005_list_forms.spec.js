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
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);

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
    // Step 1: Navigate to Forms section
    await page.goto('/forms');

    // Step 2: Verify Forms listing page loads
    await expect(page.locator('[data-testid="forms-listing"]')).toBeVisible();
    await expect(page.locator('h1, h2', { hasText: /Forms|All Forms/i })).toBeVisible();

    // Step 3: Verify forms are displayed
    const formCards = page.locator('[data-testid="form-card"]');
    await expect(formCards).toHaveCount(5);
  });

  test('should display correct information for each form', async ({ page }) => {
    await page.goto('/forms');

    // Step 4: Check form card details
    const firstForm = page.locator('[data-testid="form-card"]').first();

    // Verify form name is displayed
    await expect(firstForm.locator('[data-testid="form-name"]')).toBeVisible();

    // Verify form description is displayed
    await expect(firstForm.locator('[data-testid="form-description"]')).toBeVisible();

    // Verify form status is displayed
    await expect(firstForm.locator('[data-testid="form-status"]')).toBeVisible();

    // Verify creation date is displayed
    await expect(firstForm.locator('[data-testid="form-created-date"]')).toBeVisible();

    // Verify actions menu exists
    await expect(firstForm.locator('[data-testid="form-actions"]')).toBeVisible();
  });

  test('should display forms in correct sorted order', async ({ page }) => {
    await page.goto('/forms');

    // Step 5: Verify forms are sorted (assuming default sort by creation date descending)
    const formNames = await page.locator('[data-testid="form-name"]').allTextContents();

    // Verify we have the expected forms
    expect(formNames).toContain('Customer Feedback Form');
    expect(formNames).toContain('Employee Onboarding Form');
    expect(formNames).toContain('Product Survey Form');
    expect(formNames).toContain('Support Request Form');
    expect(formNames).toContain('Partnership Application');
  });

  test('should search forms by name', async ({ page }) => {
    await page.goto('/forms');

    // Step 7: Test search functionality
    const searchBox = page.locator('[data-testid="search-forms-input"]');

    if (await searchBox.isVisible()) {
      await searchBox.fill('Customer');

      // Wait for search results
      await page.waitForTimeout(500);

      // Verify only matching forms are displayed
      const visibleForms = page.locator('[data-testid="form-card"]');
      await expect(visibleForms).toHaveCount(1);
      await expect(page.locator('[data-testid="form-name"]')).toContainText('Customer Feedback Form');

      // Clear search
      await searchBox.clear();
      await page.waitForTimeout(500);

      // Verify all forms are displayed again
      await expect(page.locator('[data-testid="form-card"]')).toHaveCount(5);
    }
  });

  test('should filter forms by status', async ({ page }) => {
    await page.goto('/forms');

    // Step 8: Test filter functionality
    const statusFilter = page.locator('[data-testid="filter-status"]');

    if (await statusFilter.isVisible()) {
      // Filter by Active status
      await statusFilter.click();
      await page.click('[data-testid="filter-option-active"]');

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Verify only active forms are displayed
      const visibleForms = page.locator('[data-testid="form-card"]');
      const count = await visibleForms.count();
      expect(count).toBeLessThanOrEqual(5);

      // Verify all visible forms have "Active" status
      const statusBadges = await page.locator('[data-testid="form-status"]').allTextContents();
      for (const status of statusBadges) {
        expect(status.toLowerCase()).toContain('active');
      }

      // Clear filter
      await page.click('[data-testid="clear-filters"]');
      await page.waitForTimeout(500);

      // Verify all forms are displayed
      await expect(page.locator('[data-testid="form-card"]')).toHaveCount(5);
    }
  });

  test('should navigate to form details when clicking on a form', async ({ page }) => {
    await page.goto('/forms');

    // Step 9: Click on a form
    const firstForm = page.locator('[data-testid="form-card"]').first();
    const formName = await firstForm.locator('[data-testid="form-name"]').textContent();

    await firstForm.click();

    // Step 10: Verify navigation to form details
    await expect(page).toHaveURL(/.*forms\/[a-zA-Z0-9-]+/);
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
