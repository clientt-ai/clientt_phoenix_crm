const { test } = require('@playwright/test');

test.describe('Manual Auth Flow Simulation', () => {
  test('simulate exact manual user flow with pauses', async ({ page }) => {
    console.log('\n=== Simulating Manual User Flow ===\n');

    // Step 1: Go to sign-in page
    console.log('Step 1: Navigate to sign-in page');
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Pause like a human would
    console.log('  URL:', page.url());

    // Step 2: Fill in email
    console.log('\nStep 2: Fill in email');
    const emailInput = page.locator('input[name="authn-user[email]"]');
    await emailInput.click(); // Focus like a human
    await page.waitForTimeout(200);
    await emailInput.fill('sample_admin@clientt.com');
    await page.waitForTimeout(500);

    // Step 3: Fill in password
    console.log('\nStep 3: Fill in password');
    const passwordInput = page.locator('input[name="authn-user[password]"]');
    await passwordInput.click();
    await page.waitForTimeout(200);
    await passwordInput.fill('SampleAdmin123!');
    await page.waitForTimeout(500);

    // Step 4: Click sign in button
    console.log('\nStep 4: Click sign in button');
    const submitButton = page.locator('form:has(input[name="authn-user[email]"]) button[type="submit"]');
    await submitButton.click();

    // Step 5: Wait for the success message
    console.log('\nStep 5: Wait for success message');
    await page.waitForSelector('text=You are now signed in', { timeout: 10000 });
    console.log('  ✅ Success message appeared');

    // Wait a bit longer, like a human reading the message
    await page.waitForTimeout(2000);
    console.log('  Current URL after sign-in:', page.url());

    // Step 6: Check what links are available
    console.log('\nStep 6: Check available navigation');
    const allLinks = await page.$$('a[href]');
    console.log(`  Found ${allLinks.length} links`);

    // Try to find a navigation element
    const navLinks = await page.$$('nav a, [role="navigation"] a, .nav a, .navbar a, .menu a, .sidebar a');
    console.log(`  Found ${navLinks.length} navigation links`);

    if (navLinks.length > 0) {
      for (let i = 0; i < Math.min(5, navLinks.length); i++) {
        const href = await navLinks[i].getAttribute('href');
        const text = (await navLinks[i].textContent())?.trim();
        console.log(`    - "${text}" -> ${href}`);
      }
    }

    // Step 7: Type the URL in address bar (using goto)
    console.log('\nStep 7: Navigate to /forms (simulating typing in address bar)');

    // First, let's check the current session state
    const sessionBefore = await page.evaluate(() => {
      return {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
        cookies: document.cookie
      };
    });
    console.log('  Session before navigation:', JSON.stringify(sessionBefore, null, 2));

    const response = await page.goto('/forms');
    await page.waitForLoadState('networkidle');
   await page.waitForTimeout(1000);

    console.log('  Response status:', response.status());
    console.log('  Final URL:', page.url());

    // Check session after
    const sessionAfter = await page.evaluate(() => {
      return {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
        cookies: document.cookie
      };
    });
    console.log('  Session after navigation:', JSON.stringify(sessionAfter, null, 2));

    if (page.url().includes('sign-in')) {
      console.log('  ❌ Redirected back to sign-in');

      // Let's check network requests
      console.log('\nStep 8: Checking what happened...');

      // Try one more time but monitor the redirect
      await page.goto('/forms', { waitUntil: 'commit' });
      const finalUrl = page.url();
      console.log('  After second attempt, URL:', finalUrl);

    } else {
      console.log('  ✅ Successfully accessed /forms!');
      const pageTitle = await page.title();
      console.log('  Page title:', pageTitle);
    }
  });
});
