# E2E Tests - Settings & Configuration

**Track:** 05 - Forms Settings & Integrations
**Priority:** P2 (Features) - Run Nightly
**Test Count:** 4-6 tests
**Execution Time:** 4-6 minutes
**Run:** Nightly builds

---

## Overview

This track focuses on **settings and configuration tests** that verify user profile management, notification preferences, and integration placeholders.

**Test Coverage:**
- ✅ User profile viewing/editing
- ✅ Password management (if implemented)
- ✅ Notification preferences
- ✅ Integration "Coming Soon" placeholders

---

## Test Location

```
playwright_tests/tests/forms_dashboard/features/settings/
├── profile-management.spec.js
├── notification-prefs.spec.js
└── integrations-preview.spec.js
```

---

## Test Suites

### 1. Profile Management Tests (2-3 tests)
**File:** `profile-management.spec.js`

**Tests:**
- ✅ View user profile (name, email)
- ✅ Edit user profile (update name)
- ✅ Change password (if implemented)

**Example:**
```javascript
test('user can view their profile', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // When: I navigate to settings
  await page.goto('/settings');
  await page.click('[data-test="tab-profile"]');

  // Then: My profile information is displayed
  const nameInput = page.locator('[data-test="profile-name"]');
  const emailInput = page.locator('[data-test="profile-email"]');

  await expect(nameInput).toHaveValue('Form Admin');
  await expect(emailInput).toHaveValue('admin@example.com');
});

test('user can update their name', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  await page.goto('/settings');
  await page.click('[data-test="tab-profile"]');

  // When: I update my name
  await page.fill('[data-test="profile-name"]', 'Updated Admin Name');
  await page.click('[data-test="save-profile-button"]');

  // Then: Success message shown
  await expect(page.locator('[data-test="toast-success"]')).toContainText('Profile updated');

  // And: Name is persisted (refresh page)
  await page.reload();
  const nameInput = page.locator('[data-test="profile-name"]');
  await expect(nameInput).toHaveValue('Updated Admin Name');
});

test('user can change password', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  await page.goto('/settings');
  await page.click('[data-test="tab-security"]');

  // When: I change my password
  await page.fill('[data-test="current-password"]', 'SecurePass123!');
  await page.fill('[data-test="new-password"]', 'NewSecurePass456!');
  await page.fill('[data-test="confirm-password"]', 'NewSecurePass456!');
  await page.click('[data-test="change-password-button"]');

  // Then: Success message shown
  await expect(page.locator('[data-test="toast-success"]')).toContainText('Password changed');

  // And: I can sign in with new password
  await page.goto('/sign-out');
  await page.goto('/sign-in');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'NewSecurePass456!');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard');
});
```

**Why Important:** User profile management is essential - users must be able to update their information.

---

### 2. Notification Preferences Tests (1-2 tests)
**File:** `notification-prefs.spec.js`

**Tests:**
- ✅ Toggle notification preferences (email on new submission)
- ✅ Preferences persist after save

**Example:**
```javascript
test('user can toggle email notifications', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/lead-admin.json' });

  await page.goto('/settings');
  await page.click('[data-test="tab-notifications"]');

  // When: I toggle email notifications on
  const emailToggle = page.locator('[data-test="notification-email-submissions"]');
  const initialState = await emailToggle.isChecked();

  await emailToggle.click();
  await page.click('[data-test="save-notifications-button"]');

  // Then: Success message shown
  await expect(page.locator('[data-test="toast-success"]')).toContainText('Preferences saved');

  // And: Setting is persisted
  await page.reload();
  await page.click('[data-test="tab-notifications"]');

  const newState = await emailToggle.isChecked();
  expect(newState).toBe(!initialState);
});

test('notification preferences are respected', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/lead-admin.json' });

  // Given: Email notifications are enabled
  await page.goto('/settings');
  await page.click('[data-test="tab-notifications"]');
  await page.check('[data-test="notification-email-submissions"]');
  await page.click('[data-test="save-notifications-button"]');

  // When: A new submission is created
  const formSlug = 'contact-us';
  await submitFormAsPublicUser(page, formSlug, {
    'Name': 'Test User',
    'Email': 'test@example.com',
  });

  // Then: Email notification is sent (check via dev mailbox or database)
  // Note: In test environment, check dev mailbox or mock email service
  await page.goto('/dev/mailbox');
  await expect(page.locator('[data-test="email-list"]')).toContainText('New submission');
});
```

**Why Important:** Notification preferences allow users to control how they're alerted - settings must be respected.

---

### 3. Integrations Preview Tests (1-2 tests)
**File:** `integrations-preview.spec.js`

**Tests:**
- ✅ Integration cards show "Coming Soon" badges
- ✅ Cannot click disabled integration cards

**Example:**
```javascript
test('integration cards show coming soon badges', async ({ page }) => {
  await page.goto('/settings');
  await page.click('[data-test="tab-integrations"]');

  // All integration cards have "Coming Soon" badge
  const zapierCard = page.locator('[data-test="integration-zapier"]');
  await expect(zapierCard.locator('[data-test="coming-soon-badge"]')).toBeVisible();

  const slackCard = page.locator('[data-test="integration-slack"]');
  await expect(slackCard.locator('[data-test="coming-soon-badge"]')).toBeVisible();

  const webhooksCard = page.locator('[data-test="integration-webhooks"]');
  await expect(webhooksCard.locator('[data-test="coming-soon-badge"]')).toBeVisible();
});

test('coming soon integrations are not clickable', async ({ page }) => {
  await page.goto('/settings');
  await page.click('[data-test="tab-integrations"]');

  // Integration cards are disabled
  const zapierCard = page.locator('[data-test="integration-zapier"]');

  // Card has disabled state
  const isDisabled = await zapierCard.evaluate(el =>
    el.classList.contains('disabled') || el.hasAttribute('disabled')
  );
  expect(isDisabled).toBe(true);

  // Clicking does nothing (no navigation)
  await zapierCard.click();
  expect(page.url()).toContain('/settings');
});
```

**Why Important:** "Coming Soon" integrations must be clearly marked - users shouldn't expect functionality that doesn't exist yet.

---

## Page Objects

### SettingsPage
```javascript
// support/pages/SettingsPage.js
export class SettingsPage {
  constructor(page) {
    this.page = page;

    // Tabs
    this.profileTab = page.locator('[data-test="tab-profile"]');
    this.securityTab = page.locator('[data-test="tab-security"]');
    this.notificationsTab = page.locator('[data-test="tab-notifications"]');
    this.integrationsTab = page.locator('[data-test="tab-integrations"]');

    // Profile fields
    this.nameInput = page.locator('[data-test="profile-name"]');
    this.emailInput = page.locator('[data-test="profile-email"]');
    this.saveProfileButton = page.locator('[data-test="save-profile-button"]');

    // Security fields
    this.currentPasswordInput = page.locator('[data-test="current-password"]');
    this.newPasswordInput = page.locator('[data-test="new-password"]');
    this.confirmPasswordInput = page.locator('[data-test="confirm-password"]');
    this.changePasswordButton = page.locator('[data-test="change-password-button"]');

    // Notifications
    this.emailNotificationsToggle = page.locator('[data-test="notification-email-submissions"]');
    this.saveNotificationsButton = page.locator('[data-test="save-notifications-button"]');
  }

  async goto() {
    await this.page.goto('/settings');
  }

  async goToTab(tabName) {
    const tabs = {
      profile: this.profileTab,
      security: this.securityTab,
      notifications: this.notificationsTab,
      integrations: this.integrationsTab,
    };

    await tabs[tabName].click();
  }

  async updateProfile(name) {
    await this.goToTab('profile');
    await this.nameInput.fill(name);
    await this.saveProfileButton.click();
    await this.page.waitForSelector('[data-test="toast-success"]');
  }

  async changePassword(currentPassword, newPassword) {
    await this.goToTab('security');
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(newPassword);
    await this.changePasswordButton.click();
    await this.page.waitForSelector('[data-test="toast-success"]');
  }

  async toggleEmailNotifications() {
    await this.goToTab('notifications');
    await this.emailNotificationsToggle.click();
    await this.saveNotificationsButton.click();
    await this.page.waitForSelector('[data-test="toast-success"]');
  }
}
```

---

## Test Data Requirements

### User Fixtures
```javascript
// fixtures/users.js (already exists from Track 1)
// Uses same user fixtures as critical tests
```

---

## Success Criteria

- [ ] All settings tests pass
- [ ] Profile updates are persisted
- [ ] Password changes work correctly
- [ ] Notification preferences are respected
- [ ] "Coming Soon" integrations clearly marked
- [ ] Tests pass in all 3 browsers

---

## Related Documentation

- [Settings Implementation](./README.md) - Settings pages and tabs
- [Primary Overview](../20251115-01-forms-dashboard-primary/00-PRIMARY-OVERVIEW.md) - Feature requirements
- [Figma Source](../../figma_src/205 Forms Dashboard/src/components/pages/SettingsPage.tsx) - Original designs

---

**Priority:** P2 (Features)
**Status:** ✅ Ready for implementation
**Next Step:** Implement settings features, then write settings tests
