const { test, expect } = require('@playwright/test');

test.describe('Debug Authentication', () => {
  test('check form field names and cookies', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('/sign-in');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Get all input fields and their attributes
    const inputs = await page.$$('input');
    console.log('=== Form Inputs ===');
    for (const input of inputs) {
      const name = await input.getAttribute('name');
      const type = await input.getAttribute('type');
      const id = await input.getAttribute('id');
      console.log(`Name: ${name}, Type: ${type}, ID: ${id}`);
    }

    // Try different selectors
    console.log('\n=== Testing Selectors ===');

    // Test 1: input[type="email"]
    const emailByType = await page.$('input[type="email"]');
    console.log('input[type="email"]: ', emailByType ? 'FOUND' : 'NOT FOUND');

    // Test 2: input[name="user[email]"]
    const emailByName = await page.$('input[name="user[email]"]');
    console.log('input[name="user[email]"]: ', emailByName ? 'FOUND' : 'NOT FOUND');

    // Test 3: input[type="password"]
    const passwordByType = await page.$('input[type="password"]');
    console.log('input[type="password"]: ', passwordByType ? 'FOUND' : 'NOT FOUND');

    // Test 4: input[name="user[password]"]
    const passwordByName = await page.$('input[name="user[password]"]');
    console.log('input[name="user[password]"]: ', passwordByName ? 'FOUND' : 'NOT FOUND');

    // Fill in the form using CORRECT name selectors for sign-in form
    console.log('\n=== Attempting Login ===');
    await page.fill('input[name="authn-user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="authn-user[password]"]', 'SampleAdmin123!');

    // Check cookies before sign-in
    const cookiesBefore = await page.context().cookies();
    console.log('\n=== Cookies BEFORE sign-in ===');
    console.log(cookiesBefore.map(c => `${c.name}: ${c.value.substring(0, 20)}...`));

    // Find and click the correct submit button (should be within the sign-in form)
    // The sign-in form has the email field with name="authn-user[email]"
    const signInButton = await page.locator('form:has(input[name="authn-user[email]"]) button[type="submit"]');
    console.log('Sign in button found:', await signInButton.count());

    await signInButton.click();

    // Wait for navigation or response
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check URL after sign-in
    console.log('\n=== After Sign-in ===');
    console.log('Current URL:', page.url());

    // Check for any error messages
    const errorMessages = await page.$$('[role="alert"], .alert-error, .error');
    if (errorMessages.length > 0) {
      console.log('Error messages found:');
      for (const error of errorMessages) {
        const text = await error.textContent();
        console.log('  -', text);
      }
    }

    // Check for flash messages
    const flashMessages = await page.$$('.flash, [data-flash]');
    if (flashMessages.length > 0) {
      console.log('Flash messages found:');
      for (const flash of flashMessages) {
        const text = await flash.textContent();
        console.log('  -', text);
      }
    }

    // Check cookies after sign-in
    const cookiesAfter = await page.context().cookies();
    console.log('\n=== Cookies AFTER sign-in ===');
    console.log(cookiesAfter.map(c => `${c.name}: ${c.value.substring(0, 20)}...`));

    // Try to navigate to /forms
    console.log('\n=== Navigating to /forms ===');
    await page.goto('/forms');
    await page.waitForLoadState('networkidle');

    console.log('URL after goto /forms:', page.url());

    // Check cookies after navigation
    const cookiesAfterNav = await page.context().cookies();
    console.log('\n=== Cookies AFTER navigation ===');
    console.log(cookiesAfterNav.map(c => `${c.name}: ${c.value.substring(0, 20)}...`));

    // Check if we're still authenticated
    if (page.url().includes('sign-in')) {
      console.log('❌ REDIRECTED BACK TO SIGN-IN');
    } else {
      console.log('✅ STAYED ON AUTHENTICATED PAGE');
    }
  });
});
