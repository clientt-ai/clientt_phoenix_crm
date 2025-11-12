// @ts-check
const { test as base } = require('@playwright/test');
const { loginAsTestUser } = require('../support/auth-helpers');

/**
 * Authenticated User Fixture
 *
 * This fixture automatically logs in a user before each test,
 * useful for testing authenticated routes without repeating login logic.
 *
 * Usage:
 * const { test, expect } = require('./fixtures/authenticated');
 *
 * test('my authenticated test', async ({ page }) => {
 *   // User is already logged in here
 * });
 */

const test = base.extend({
  page: async ({ page }, use) => {
    // Set up: Log in the user before each test
    await loginAsTestUser(page);

    // Use the page in the test
    await use(page);

    // Tear down: Any cleanup if needed
  },
});

module.exports = { test };
