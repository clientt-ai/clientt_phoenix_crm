// @ts-check

/**
 * Login Page Object Model
 *
 * Encapsulates the login page elements and interactions.
 * This follows the Page Object Model (POM) pattern for better test maintainability.
 */

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Selectors
    this.emailInput = 'input[name="user[email]"]';
    this.passwordInput = 'input[name="user[password]"]';
    this.submitButton = 'button[type="submit"]';
    this.registerLink = 'text=Register';
    this.forgotPasswordLink = 'text=/forgot.*password|reset.*password/i';
    this.errorMessage = 'text=/invalid|incorrect|error/i';
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/sign-in');
  }

  /**
   * Fill in the email field
   * @param {string} email
   */
  async fillEmail(email) {
    await this.page.fill(this.emailInput, email);
  }

  /**
   * Fill in the password field
   * @param {string} password
   */
  async fillPassword(password) {
    await this.page.fill(this.passwordInput, password);
  }

  /**
   * Click the submit button
   */
  async submit() {
    await this.page.click(this.submitButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Perform a complete login operation
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /**
   * Click the register link
   */
  async goToRegister() {
    await this.page.click(this.registerLink);
  }

  /**
   * Click the forgot password link
   */
  async goToForgotPassword() {
    await this.page.click(this.forgotPasswordLink);
  }

  /**
   * Check if error message is displayed
   * @returns {Promise<boolean>}
   */
  async hasErrorMessage() {
    return await this.page.locator(this.errorMessage).isVisible();
  }

  /**
   * Get the error message text
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    return await this.page.locator(this.errorMessage).textContent() || '';
  }
}

module.exports = { LoginPage };
