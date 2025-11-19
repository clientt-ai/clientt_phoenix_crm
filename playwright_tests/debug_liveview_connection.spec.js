const { test, expect } = require('@playwright/test');

test.describe('Debug LiveView WebSocket Connection', () => {
  test('check if LiveView socket connects before navigation', async ({ page }) => {
    console.log('\n=== Testing LiveView Socket Connection ===\n');

    // Navigate to sign-in page
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');

    // Sign in
    console.log('Signing in...');
    await page.fill('input[name="authn-user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="authn-user[password]"]', 'SampleAdmin123!');

    const signInButton = page.locator('form:has(input[name="authn-user[email]"]) button[type="submit"]');
    await signInButton.click();

    // Wait for success message
    await page.waitForSelector('text=You are now signed in', { timeout: 5000 });
    console.log('✅ Signed in successfully\n');

    // Check if LiveView socket is connected
    const liveViewConnected = await page.evaluate(() => {
      // Check if there's a LiveView socket
      const socket = window.liveSocket;
      if (socket) {
        return {
          exists: true,
          isConnected: socket.isConnected ? socket.isConnected() : null,
          channels: socket.channels ? socket.channels.length : 0
        };
      }
      return { exists: false };
    });

    console.log('LiveView Socket Status:', liveViewConnected);

    // Wait a bit longer to ensure socket is connected
    console.log('\nWaiting for LiveView socket to stabilize...');
    await page.waitForTimeout(2000);

    // Try clicking a link on the page instead of using goto
    console.log('\n=== Attempting Link Click Navigation ===');

    // Look for any navigation links on the page
    const links = await page.$$('a[href]');
    console.log(`Found ${links.length} links on the page`);

    for (const link of links.slice(0, 10)) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`  - "${text?.trim()}" -> ${href}`);
    }

    // Try to find a link that goes to the main page or forms
    const homeLink = await page.$('a[href="/"]');
    if (homeLink) {
      console.log('\nClicking home link...');
      await homeLink.click();
      await page.waitForLoadState('networkidle');
      console.log('After clicking home link, URL:', page.url());

      // Now try to navigate to forms
      const formsLink = await page.$('a[href="/forms"]');
      if (formsLink) {
        console.log('Clicking forms link...');
        await formsLink.click();
        await page.waitForLoadState('networkidle');
        console.log('After clicking forms link, URL:', page.url());
      } else {
        console.log('No forms link found, trying goto...');
        await page.goto('/forms');
        await page.waitForLoadState('networkidle');
        console.log('After goto forms, URL:', page.url());
      }
    } else {
      console.log('\nNo home link found, trying direct navigation...');

      // Try using LiveView push_patch or push_navigate
      const navigateResult = await page.evaluate(() => {
        if (window.liveSocket && window.liveSocket.main) {
          // Try to get the LiveView instance
          const view = window.liveSocket.main;
          if (view && view.pushNavigate) {
            view.pushNavigate('/forms');
            return 'pushNavigate called';
          }
        }
        return 'LiveView navigation not available';
      });

      console.log('LiveView navigate result:', navigateResult);
      await page.waitForTimeout(2000);
      console.log('After LiveView navigate, URL:', page.url());
    }

    // Final check
    console.log('\n=== Final State ===');
    console.log('Current URL:', page.url());
    console.log('On sign-in page?', page.url().includes('sign-in'));
  });

  test('compare page.goto vs page.click navigation', async ({ page }) => {
    console.log('\n=== Comparing Navigation Methods ===\n');

    // Set up: sign in first
    await page.goto('/sign-in');
    await page.fill('input[name="authn-user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="authn-user[password]"]', 'SampleAdmin123!');
    await page.locator('form:has(input[name="authn-user[email]"]) button[type="submit"]').click();
    await page.waitForSelector('text=You are now signed in', { timeout: 5000 });
    console.log('✅ Signed in\n');

    // Method 1: Using page.goto
    console.log('Method 1: Using page.goto("/forms")');
    const gotoResponse = await page.goto('/forms');
    console.log('  Response status:', gotoResponse.status());
    console.log('  Final URL:', page.url());
    console.log('  Redirected to sign-in?', page.url().includes('sign-in'));

    // Go back to a safe page
    await page.goto('/sign-in');
    await page.waitForTimeout(1000);

    // Method 2: Creating a link and clicking it
    console.log('\nMethod 2: Creating a link element and clicking it');
    await page.evaluate(() => {
      const link = document.createElement('a');
      link.href = '/forms';
      link.id = 'test-forms-link';
      link.textContent = 'Test Forms Link';
      document.body.appendChild(link);
    });

    await page.click('#test-forms-link');
    await page.waitForLoadState('networkidle');
    console.log('  Final URL:', page.url());
    console.log('  Redirected to sign-in?', page.url().includes('sign-in'));
  });
});
