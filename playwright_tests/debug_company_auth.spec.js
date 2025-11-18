const { test, expect } = require('@playwright/test');

test.describe('Debug Company Authorization', () => {
  test('check company assignment and LiveView mount', async ({ page }) => {
    console.log('\n=== Starting Company Authorization Debug ===\n');

    // Navigate to sign-in page
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');

    // Sign in with admin account
    console.log('Signing in as sample_admin@clientt.com...');
    await page.fill('input[name="authn-user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="authn-user[password]"]', 'SampleAdmin123!');

    const signInButton = page.locator('form:has(input[name="authn-user[email]"]) button[type="submit"]');
    await signInButton.click();

    // Wait for authentication
    await page.waitForSelector('text=You are now signed in', { timeout: 5000 });
    console.log('✅ Authentication succeeded\n');

    // Check current URL
    console.log('URL after sign-in:', page.url());

    // Check cookies
    const cookiesAfterSignIn = await page.context().cookies();
    console.log('\n=== Cookies After Sign-in ===');
    cookiesAfterSignIn.forEach(cookie => {
      console.log(`${cookie.name}:`);
      console.log(`  Domain: ${cookie.domain}`);
      console.log(`  Path: ${cookie.path}`);
      console.log(`  Secure: ${cookie.secure}`);
      console.log(`  HttpOnly: ${cookie.httpOnly}`);
      console.log(`  SameSite: ${cookie.sameSite}`);
    });

    // Try clicking a link instead of using goto
    console.log('\n=== Attempting Link Navigation ===');
    const formsLink = await page.$('a[href="/forms"]');
    if (formsLink) {
      console.log('Found forms link, clicking it...');
      await formsLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      console.log('No forms link found, using page.goto()...');
      await page.goto('/forms');
      await page.waitForLoadState('networkidle');
    }

    console.log('URL after navigation:', page.url());

    // Check if we're still authenticated
    if (page.url().includes('sign-in')) {
      console.log('❌ REDIRECTED BACK TO SIGN-IN\n');

      // Check for error messages
      const pageContent = await page.content();
      console.log('=== Page Content Preview ===');
      console.log(pageContent.substring(0, 500));

    } else {
      console.log('✅ STAYED ON AUTHENTICATED PAGE\n');

      // Check page title
      const title = await page.title();
      console.log('Page title:', title);

      // Look for form elements
      const createButton = await page.$('[data-testid="create-form-button"]');
      console.log('Create form button found:', createButton ? 'YES' : 'NO');

      // Check for any visible text
      const h1 = await page.$('h1');
      if (h1) {
        const h1Text = await h1.textContent();
        console.log('H1 text:', h1Text);
      }
    }

    // Try making an API call to check session
    console.log('\n=== Testing API with Session ===');
    const response = await page.goto('/forms');
    console.log('Response status:', response.status());
    console.log('Response URL:', response.url());
    console.log('Final page URL:', page.url());

    // Check local storage and session storage
    const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
    const sessionStorage = await page.evaluate(() => JSON.stringify(window.sessionStorage));
    console.log('\n=== Storage ===');
    console.log('LocalStorage:', localStorage);
    console.log('SessionStorage:', sessionStorage);
  });
});
