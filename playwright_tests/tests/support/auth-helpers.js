// @ts-check

/**
 * Authentication Helper Functions
 *
 * Reusable functions for authentication-related operations in tests.
 */

/**
 * Logs in a user with the provided credentials
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<void>}
 */
async function login(page, email, password) {
  await page.goto('/sign-in');
  await page.fill('input[name="user[email]"]', email);
  await page.fill('input[name="user[password]"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
}

/**
 * Logs in using default test credentials from environment
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
async function loginAsTestUser(page) {
  const email = process.env.TEST_USER_EMAIL || 'test@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'SecurePassword123!';
  await login(page, email, password);
}

/**
 * Logs out the current user
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
async function logout(page) {
  await page.click('text=/log out|sign out/i');
  await page.waitForLoadState('networkidle');
}

/**
 * Registers a new user with the provided details
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<void>}
 */
async function register(page, email, password) {
  await page.goto('/sign-in');
  await page.click('text=Register');
  await page.fill('input[name="user[email]"]', email);
  await page.fill('input[name="user[password]"]', password);
  await page.fill('input[name="user[password_confirmation]"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
}

/**
 * Generates a unique test email address
 *
 * @param {string} [prefix='testuser'] - Email prefix
 * @returns {string} - Unique email address
 */
function generateTestEmail(prefix = 'testuser') {
  const timestamp = Date.now();
  return `${prefix}${timestamp}@example.com`;
}

/**
 * Checks if user is authenticated by verifying they're not on the sign-in page
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>}
 */
async function isAuthenticated(page) {
  const url = page.url();
  return !url.includes('sign-in');
}

module.exports = {
  login,
  loginAsTestUser,
  logout,
  register,
  generateTestEmail,
  isAuthenticated,
};
