// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'screenshots', 'main');

test.describe('FG-SC-001: Figma Forms Dashboard - Screenshot Capture', () => {

  test.describe.configure({ mode: 'serial' });

  async function screenshot(page, name) {
    // Take light mode screenshot
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(screenshotsDir, `${name}-light.png`),
      fullPage: false
    });

    // Take dark mode screenshot
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(screenshotsDir, `${name}-dark.png`),
      fullPage: false
    });

    // Reset to light mode for next test
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
  }

  test('01 - Dashboard Page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await screenshot(page, '01-dashboard-page');
  });

  test('02 - Forms Page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Forms in sidebar
    await page.click('text=Forms');
    await page.waitForTimeout(500);
    await screenshot(page, '02-forms-page');
  });

  test('03 - Form Builder Page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Forms first
    await page.click('text=Forms');
    await page.waitForTimeout(500);

    // Click Create New Form button to enter Form Builder
    const createFormBtn = page.locator('button:has-text("Create New Form"), button:has-text("New")').first();
    if (await createFormBtn.isVisible()) {
      await createFormBtn.click();
      await page.waitForTimeout(500);
    }
    await screenshot(page, '03-form-builder-page');
  });

  test('04 - Contacts Page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Contacts in sidebar
    await page.click('text=Contacts');
    await page.waitForTimeout(500);
    await screenshot(page, '04-contacts-page');
  });

  test('05 - Calendar Integration Page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Calendar Integration in sidebar
    await page.click('text=Calendar Integration');
    await page.waitForTimeout(500);
    await screenshot(page, '05-calendar-integration-page');
  });

  test('06 - Chatbot Page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Chatbot in sidebar
    await page.click('text=Chatbot');
    await page.waitForTimeout(500);
    await screenshot(page, '06-chatbot-page');
  });

  test('07 - Settings Page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Settings in sidebar
    await page.click('text=Settings');
    await page.waitForTimeout(500);
    await screenshot(page, '07-settings-page');
  });

  test('08 - Notifications Page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Notifications is accessed via bell icon in header, not sidebar
    // Click the bell icon to open notifications dropdown
    const bellBtn = page.locator('button').filter({ has: page.locator('svg.lucide-bell') });
    if (await bellBtn.isVisible()) {
      await bellBtn.click();
      await page.waitForTimeout(300);

      // Click "View all notifications" to go to full page
      const viewAllBtn = page.locator('text=View all notifications');
      if (await viewAllBtn.isVisible()) {
        await viewAllBtn.click();
        await page.waitForTimeout(500);
      }
    }
    await screenshot(page, '08-notifications-page');
  });

  test('09 - Dashboard with Sidebar Collapsed', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Toggle sidebar (look for hamburger/menu button)
    const toggleBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(300);
    }
    await screenshot(page, '09-dashboard-sidebar-collapsed');
  });

  test('10 - Forms Page - Create Form Flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Forms
    await page.click('text=Forms');
    await page.waitForTimeout(500);

    // Click Create Form
    const createBtn = page.locator('button:has-text("Create New Form"), button:has-text("New")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);
    }
    await screenshot(page, '10-forms-create-flow');
  });

  test('11 - Settings - Profile Tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Settings
    await page.click('text=Settings');
    await page.waitForTimeout(500);

    // Click Profile tab if visible
    const profileTab = page.locator('text=Profile').first();
    if (await profileTab.isVisible()) {
      await profileTab.click();
      await page.waitForTimeout(300);
    }
    await screenshot(page, '11-settings-profile');
  });

  test('12 - Settings - Integrations Tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Settings
    await page.click('text=Settings');
    await page.waitForTimeout(500);

    // Click Integrations tab
    const integrationsTab = page.locator('text=Integrations');
    if (await integrationsTab.isVisible()) {
      await integrationsTab.click();
      await page.waitForTimeout(300);
    }
    await screenshot(page, '12-settings-integrations');
  });

  test('13 - Settings - Security Tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Settings
    await page.click('text=Settings');
    await page.waitForTimeout(500);

    // Click Security tab
    const securityTab = page.locator('text=Security');
    if (await securityTab.isVisible()) {
      await securityTab.click();
      await page.waitForTimeout(300);
    }
    await screenshot(page, '13-settings-security');
  });

  test('14 - Chatbot Widget Open', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Chatbot page first
    await page.click('text=Chatbot');
    await page.waitForTimeout(500);

    // Look for chatbot widget button (usually bottom right floating button)
    // Note: This may not exist in the current Figma mockup
    const chatWidgetBtn = page.locator('button[aria-label*="chat" i], button[aria-label*="help" i], [data-testid="chat-widget"]').first();
    if (await chatWidgetBtn.count() > 0 && await chatWidgetBtn.isEnabled()) {
      await chatWidgetBtn.click();
      await page.waitForTimeout(500);
    }
    await screenshot(page, '14-chatbot-widget-open');
  });

});
