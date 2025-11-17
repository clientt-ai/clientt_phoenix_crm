# testing

## Description
Comprehensive testing framework and guidelines for any module in the Phoenix CRM application, including manual test execution and Playwright automation.

## When to Use This Skill

Use this skill when you need to:
- Set up testing infrastructure for a new module
- Execute manual tests for any feature
- Run or debug Playwright automated tests
- Create new test scenarios for features
- Update existing test artifacts based on functionality changes
- Generate test reports or track test execution status
- Understand the testing structure and conventions

## Testing Structure Overview

All modules follow a standardized testing structure:

```
specs/06-test_plans/{module_name}/
├── {Module}_Test_Status.md        # Master test tracker
├── README.md                       # Module-specific guide
└── manual_tests/                   # Detailed manual test scenarios
    ├── {XX}-SC-001_scenario.md
    ├── {XX}-SC-002_scenario.md
    └── ...

playwright_tests/{module_name}/     # Automated Playwright tests
├── {XX}-SC-001_scenario.spec.js
├── {XX}-SC-002_scenario.spec.js
└── ...
```

**Naming Conventions**:
- `{module_name}`: Lowercase module name (e.g., `forms`, `contacts`, `deals`)
- `{Module}`: Title case module name (e.g., `Forms`, `Contacts`, `Deals`)
- `{XX}`: Two-letter module prefix (e.g., `FM` for Forms, `CT` for Contacts)
- `{SC}`: Scenario identifier

**Example - Forms Module**:
```
specs/06-test_plans/forms/
├── Forms_Test_Status.md
└── manual_tests/
    ├── FM-SC-001_create_form.md
    ├── FM-SC-002_configure_fields.md
    └── ...

playwright_tests/forms/
├── FM-SC-001_create_form.spec.js
├── FM-SC-002_configure_fields.spec.js
└── ...
```

## Manual Testing Workflow

### 1. Executing Manual Tests

#### Step 1: Review the Test Status Tracker
- Location: `specs/06-test_plans/{module_name}/{Module}_Test_Status.md`
- Check current test status and identify pending tests
- Note any blockers or dependencies

#### Step 2: Select a Test Scenario
- Choose a scenario from the status tracker
- Open the corresponding manual test file in `specs/06-test_plans/{module_name}/manual_tests/`

#### Step 3: Prepare Test Environment
- Ensure the application is running (`mix phx.server`)
- Verify database is in correct state
- Log in with appropriate test credentials
- Set up any required test data

#### Step 4: Execute Test Steps
- Follow each numbered step in the manual test file
- Document any deviations from expected results
- Take screenshots for any issues found
- Record actual vs. expected behavior

#### Step 5: Update Test Status
- Mark "Manual Steps Complete" status in the tracker
- Document any issues in the "Issues/Blockers" column
- Update test execution date if tracked
- Link to bug reports if issues found

### 2. Manual Test File Template

Each manual test file should contain:

```markdown
# {XX}-SC-###: Scenario Title

## Scenario Title
Clear, concise description of what is being tested.

## Prerequisites
- List all required setup
- Test user credentials needed
- Any data that must exist
- Application state requirements

## Test Steps

1. Navigate to...
2. Click on...
3. Enter data...
4. Verify that...
5. [Continue with explicit steps]

## Expected Result
- Clear description of successful outcome
- All success criteria listed
- What should be visible/changed
- What notifications/messages should appear

## Test Data
- **Field 1**: "Value 1"
- **Field 2**: "Value 2"
- **Field 3**: "Value 3"

## Notes
- Additional considerations
- Edge cases to verify
- Browser-specific issues
- Performance expectations
```

### 3. Test Status Tracker Template

Create `{Module}_Test_Status.md` with this structure:

```markdown
# {Module} Module - Test Plan & Status Tracker

## Overview
Brief description of the module and testing scope.

## Test Scenarios Status

| Scenario ID | Scenario Title | Manual Test File | Playwright File | Manual Steps Complete | Playwright Script Complete | Playwright Execution Status | Issues/Blockers |
|-------------|----------------|------------------|-----------------|----------------------|----------------------------|----------------------------|-----------------|
| {XX}-SC-001 | Scenario Name | `./manual_tests/{XX}-SC-001_name.md` | `../../playwright_tests/{module}/...` | ❌ No | ❌ No | ❓ Untested | None |

## Test Coverage Summary

- **Total Scenarios**: X
- **Manual Tests Completed**: 0/X (0%)
- **Playwright Scripts Completed**: 0/X (0%)
- **Passing Tests**: 0/X (0%)

## Legend

**Manual Steps Complete:**
- ✅ Yes - Documentation complete and reviewed
- 🚧 WIP - Work in progress
- ❌ No - Not started

**Playwright Script Complete:**
- ✅ Yes - Script implemented and reviewed
- 🚧 WIP - Work in progress
- ❌ No - Not started

**Playwright Execution Status:**
- ✅ Pass - Test passed successfully
- ❌ Fail - Test failed
- ❓ Untested - Not yet executed
```

## Playwright Automation Workflow

### 1. Running Playwright Tests

```bash
# Install Playwright dependencies (first time only)
npm install
npx playwright install

# Run all tests for a specific module
npx playwright test playwright_tests/{module_name}/

# Run a specific test scenario
npx playwright test playwright_tests/{module_name}/{XX}-SC-001_scenario.spec.js

# Run tests in headed mode (see browser)
npx playwright test playwright_tests/{module_name}/ --headed

# Run tests in debug mode
npx playwright test playwright_tests/{module_name}/{XX}-SC-001_scenario.spec.js --debug

# Generate test report
npx playwright test playwright_tests/{module_name}/ --reporter=html
npx playwright show-report
```

### 2. Playwright Test File Template

```javascript
const { test, expect } = require('@playwright/test');

/**
 * {XX}-SC-###: Scenario Title
 *
 * Brief description of what this test verifies.
 */

test.describe('{XX}-SC-###: Scenario Title', () => {

  test.beforeEach(async ({ page }) => {
    // Setup: Login, create test data, navigate
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Additional setup as needed
  });

  test('should perform main scenario successfully', async ({ page }) => {
    // Navigate to feature
    await page.goto('/feature-path');

    // Perform actions
    await page.click('[data-testid="action-button"]');
    await page.fill('[data-testid="input-field"]', 'test value');

    // Verify results
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="result"]')).toContainText('Expected value');
  });

  test('should handle validation errors', async ({ page }) => {
    // Test error cases
    await page.goto('/feature-path');
    await page.click('[data-testid="submit-button"]');

    // Verify error messages
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Delete test data if needed
  });

});
```

### 3. Common Playwright Patterns

#### Selector Best Practices
Always use `data-testid` attributes for reliable selection:

```javascript
// Good - Stable selector
'[data-testid="create-button"]'
'[data-testid="input-email"]'
'[data-testid="error-message"]'

// Avoid - Brittle selectors
'.btn-primary'  // CSS classes can change
'#submit'       // IDs might be dynamic
'button:nth-child(2)'  // Position-based
```

#### Common Assertions

```javascript
// Visibility
await expect(page.locator('[data-testid="element"]')).toBeVisible();
await expect(page.locator('[data-testid="element"]')).not.toBeVisible();

// Text content
await expect(page.locator('[data-testid="message"]')).toContainText('Success');
await expect(page.locator('[data-testid="title"]')).toHaveText('Exact Title');

// Form inputs
await expect(page.locator('[data-testid="input"]')).toHaveValue('expected value');
await expect(page.locator('[data-testid="checkbox"]')).toBeChecked();

// URL
await expect(page).toHaveURL(/.*dashboard/);
await expect(page).toHaveURL('http://localhost:4002/specific/path');

// Count
await expect(page.locator('[data-testid="list-item"]')).toHaveCount(5);
```

### 4. Debugging Playwright Tests

When tests fail:

1. **Run in headed mode** to see browser actions:
   ```bash
   npx playwright test path/to/test.spec.js --headed
   ```

2. **Use debug mode** for step-by-step execution:
   ```bash
   npx playwright test path/to/test.spec.js --debug
   ```

3. **Check screenshots** in `test-results/` directory

4. **Review trace files** for detailed execution logs:
   ```bash
   npx playwright show-trace test-results/.../trace.zip
   ```

5. **Use Playwright Inspector**:
   ```bash
   npx playwright test path/to/test.spec.js --debug
   # Or add await page.pause() in your test
   ```

6. **Verify selectors** in the browser DevTools:
   ```bash
   npx playwright codegen http://localhost:4002
   ```

## Creating New Test Scenarios

### Step-by-Step Process

#### 1. Update the Status Tracker
- Open `specs/06-test_plans/{module_name}/{Module}_Test_Status.md`
- Add a new row with:
  - Unique scenario ID (e.g., `{XX}-SC-009`)
  - Descriptive scenario title
  - File paths for manual and Playwright tests
  - Initial status (all ❌ No and ❓ Untested)

#### 2. Create Manual Test File
```bash
# Create the manual test file
touch specs/06-test_plans/{module_name}/manual_tests/{XX}-SC-###_scenario_name.md
```

Use the manual test template above and include:
- Scenario Title
- Prerequisites
- Test Steps (numbered and explicit)
- Expected Result
- Test Data
- Notes

#### 3. Create Playwright Test File
```bash
# Create the Playwright test file
touch playwright_tests/{module_name}/{XX}-SC-###_scenario_name.spec.js
```

Use the Playwright test template above and implement:
- `test.describe()` block with scenario ID and title
- `test.beforeEach()` for setup (login, navigation, test data)
- Multiple `test()` blocks for different test cases
- Proper assertions with `expect()`
- `test.afterEach()` for cleanup if needed

#### 4. Implement and Validate
- Write the manual test steps first
- Execute the manual test to validate expected behavior
- Implement the Playwright automation
- Run the Playwright test to verify automation
- Update status tracker with results

## Updating Existing Tests

When functionality changes:

### 1. Identify Affected Tests
- Review `{Module}_Test_Status.md`
- Determine which scenarios are impacted
- Note what specifically changed

### 2. Update Manual Test Documentation
- Modify test steps to reflect new behavior
- Update expected results
- Adjust test data if needed
- Add notes about the changes

### 3. Update Playwright Tests
- Modify selectors if UI changed
- Update assertions for new behavior
- Add new test cases if needed
- Remove obsolete test cases

### 4. Re-execute Tests
- Run manual tests to validate changes
- Execute Playwright tests to ensure automation works
- Update status tracker with new results

## Test Data Management

### Standard Test User Accounts

```
Admin User:
- Email: admin@example.com
- Password: password123
- Permissions: Full access to all features

Regular User:
- Email: user@example.com
- Password: password123
- Permissions: Limited/standard access

Read-Only User:
- Email: readonly@example.com
- Password: password123
- Permissions: View-only access
```

### Test Data Naming Conventions

Use predictable, identifiable test data:
- Include "Test" in names (e.g., "Test Customer", "Test Form")
- Use timestamps for uniqueness (e.g., `Test Form ${Date.now()}`)
- Use consistent values across tests
- Document test data in manual test files

### Cleanup Strategy

After test execution:
- Delete test data created during tests
- Reset database to clean state for test runs
- Use `test.afterEach()` hooks in Playwright for cleanup
- Maintain test database isolation

```bash
# Reset test database
MIX_ENV=test mix ash.reset

# Run specific seeds for testing
MIX_ENV=test mix run priv/repo/test_seeds.exs
```

## Status Tracking and Reporting

### Updating the Status Tracker

Update `{Module}_Test_Status.md` regularly:

1. **Manual Steps Complete**
   - ✅ Yes: Documentation complete and reviewed
   - 🚧 WIP: Work in progress
   - ❌ No: Not started

2. **Playwright Script Complete**
   - ✅ Yes: Script implemented and reviewed
   - 🚧 WIP: Work in progress
   - ❌ No: Not started

3. **Playwright Execution Status**
   - ✅ Pass: Test passed successfully
   - ❌ Fail: Test failed (link to issue)
   - ❓ Untested: Not yet executed

### Generating Test Reports

```bash
# Run tests with HTML reporter
npx playwright test playwright_tests/{module}/ --reporter=html

# Open the report
npx playwright show-report

# Generate JSON report for CI/CD
npx playwright test playwright_tests/{module}/ --reporter=json > test-results.json

# Generate JUnit XML for CI systems
npx playwright test playwright_tests/{module}/ --reporter=junit > junit-results.xml
```

## Best Practices

### Manual Testing
- Always test in a clean environment
- Document deviations from expected behavior immediately
- Test with various data types and edge cases
- Verify error messages are clear and user-friendly
- Test across different browsers if applicable
- Include accessibility testing (keyboard navigation, screen readers)

### Playwright Automation
- **Use `data-testid` attributes** for reliable selectors
- **Implement proper wait strategies** - avoid hard-coded timeouts
- **Write descriptive test names** that explain what is being tested
- **Keep tests independent** - each test should run in isolation
- **Make tests idempotent** - can be run multiple times safely
- **Use beforeEach/afterEach** for common setup and cleanup
- **Add comments** to explain complex interactions
- **Handle async operations properly** with await
- **Use page object patterns** for complex pages

### Test Maintenance
- Update tests when features change
- Keep status tracker current and accurate
- Archive obsolete test scenarios (don't delete)
- Review and refactor tests regularly
- Remove flaky tests or fix them immediately
- Document known issues and workarounds

## Common Issues and Solutions

### Playwright test times out
**Solution**:
- Increase timeout in playwright.config.js
- Add explicit waits for dynamic content: `await page.waitForSelector('[data-testid="element"]')`
- Check if selectors are correct
- Verify network requests aren't blocking

### Test passes locally but fails in CI
**Solution**:
- Check for timing issues (use waitFor instead of timeouts)
- Verify test data is set up correctly in CI
- Check environment variables
- Review CI logs for specific errors
- Test in headless mode locally: `--headed=false`

### Selectors not found
**Solution**:
- Verify `data-testid` attributes exist in UI code
- Check if element is inside iframe or shadow DOM
- Use Playwright inspector to debug: `npx playwright codegen`
- Ensure element is visible (not display:none or opacity:0)
- Check if page has loaded: `await page.waitForLoadState('networkidle')`

### Test data conflicts
**Solution**:
- Use unique identifiers with timestamps
- Clean up test data in afterEach hooks
- Use test database isolation (MIX_ENV=test)
- Implement proper teardown

### Flaky tests
**Solution**:
- Remove hard-coded waits (page.waitForTimeout)
- Use proper assertions that wait: `expect(element).toBeVisible()`
- Fix race conditions in application code
- Add explicit waits for async operations
- Increase timeout for slow operations

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: {Module} Module Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Elixir
        uses: erlef/setup-beam@v1
        with:
          elixir-version: '1.15'
          otp-version: '26'

      - name: Install Elixir dependencies
        run: mix deps.get

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Node dependencies
        run: npm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Set up test database
        run: MIX_ENV=test mix ash.setup

      - name: Start Phoenix server
        run: mix phx.server &

      - name: Wait for server
        run: npx wait-on http://localhost:4002

      - name: Run Playwright tests
        run: npx playwright test playwright_tests/{module_name}/

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos
          path: test-results/
```

## Playwright Configuration

Create `playwright.config.js` in project root:

```javascript
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './playwright_tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:4002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'mix phx.server',
    url: 'http://localhost:4002',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Related Documentation

- **Playwright Official Docs**: https://playwright.dev/
- **Project Testing Guidelines**: Use `/project-guidelines` for Phoenix-specific patterns
- **Phoenix Testing Guide**: Use `/phoenix-guidelines` for LiveView testing
- **Ash Testing Patterns**: Use `ash-testing` skill for resource testing
- **Elixir Testing**: Use `/elixir-guidelines` for ExUnit patterns

## Quick Reference Commands

```bash
# Development
mix phx.server                     # Start Phoenix server
mix test                           # Run all Elixir tests
mix test test/path/file.exs        # Run specific test file

# Playwright - All Tests
npx playwright test                # Run all Playwright tests
npx playwright test --headed       # Run with visible browser
npx playwright test --debug        # Debug mode
npx playwright show-report         # View HTML report

# Playwright - Module-Specific
npx playwright test playwright_tests/{module}/
npx playwright test playwright_tests/{module}/ --headed
npx playwright test playwright_tests/{module}/{XX}-SC-001.spec.js

# Database
mix ash.reset                      # Reset database
MIX_ENV=test mix ash.reset         # Reset test database
mix ash_postgres.migrate           # Run migrations

# Debugging
npx playwright codegen             # Generate test code
npx playwright show-trace trace.zip # View trace file
```

## Example: Forms Module

The Forms module is a complete example of this testing structure:

- **Status Tracker**: `specs/06-test_plans/forms/Forms_Test_Status.md`
- **Manual Tests**: `specs/06-test_plans/forms/manual_tests/FM-SC-*.md`
- **Playwright Tests**: `playwright_tests/forms/FM-SC-*.spec.js`
- **Module Prefix**: `FM` (Forms Module)

Review the Forms module tests as a reference implementation when creating tests for new modules.

## Notes

- Test scenarios should be updated whenever functionality changes
- Both manual and automated tests should be maintained in parallel
- The status tracker is the single source of truth for test coverage
- Regular test execution ensures module reliability
- Test failures should be investigated immediately and documented
- Archive old test scenarios rather than deleting them
- Keep test documentation in sync with implementation
