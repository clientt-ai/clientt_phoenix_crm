# Forms Module - Testing Artifacts

## Overview

This directory contains comprehensive testing artifacts for the Forms Module, including:
- **Test Status Tracker**: High-level overview of all test scenarios
- **Manual Test Specifications**: Detailed test procedures for human execution
- **Automated Playwright Tests**: JavaScript-based automated test scripts

## Directory Structure

```
specs/06-test_plans/forms/
├── README.md                      # This file
├── Forms_Test_Status.md           # Master test tracker and status
└── manual_tests/                  # Manual test scenarios
    ├── FM-SC-001_create_form.md
    ├── FM-SC-002_configure_fields.md
    ├── FM-SC-003_submit_valid.md
    ├── FM-SC-004_validation_invalid.md
    ├── FM-SC-005_list_forms.md
    ├── FM-SC-006_edit_form.md
    ├── FM-SC-007_delete_form.md
    └── FM-SC-008_field_types.md
```

## Getting Started

### For QA Testers (Manual Testing)

1. **Review the Test Plan**
   - Open `Forms_Test_Status.md` to see all test scenarios
   - Check which tests are pending execution

2. **Execute a Test Scenario**
   - Open the corresponding test file from `manual_tests/`
   - Follow the step-by-step instructions
   - Verify expected results

3. **Report Results**
   - Update the status tracker with test results
   - Document any issues found
   - Create bug reports as needed

### For Developers (Automated Testing)

1. **Install Playwright**
   ```bash
   npm install
   npx playwright install
   ```

2. **Run Tests**
   ```bash
   # Run all forms tests
   npx playwright test playwright_tests/forms/

   # Run specific test
   npx playwright test playwright_tests/forms/FM-SC-001_create_form.spec.js

   # Run with UI
   npx playwright test playwright_tests/forms/ --headed
   ```

3. **View Results**
   ```bash
   npx playwright test --reporter=html
   npx playwright show-report
   ```

## Test Scenarios

| ID | Scenario | Manual Test | Automation |
|----|----------|-------------|------------|
| FM-SC-001 | Create New Form Successfully | ✓ | ✓ |
| FM-SC-002 | Configure Form Fields and Validation | ✓ | ✓ |
| FM-SC-003 | Submit Form with Valid Data | ✓ | ✓ |
| FM-SC-004 | Form Validation with Invalid Data | ✓ | ✓ |
| FM-SC-005 | View and List All Forms | ✓ | ✓ |
| FM-SC-006 | Edit Existing Form | ✓ | ✓ |
| FM-SC-007 | Delete Form | ✓ | ✓ |
| FM-SC-008 | Form Field Type Validation | ✓ | ✓ |

## Claude Code Skill

For comprehensive testing guidance, use the general testing skill:

```
/skill testing
```

This skill provides:
- Module-agnostic testing framework
- Manual and Playwright testing workflows
- Test creation templates and guidelines
- Debugging and troubleshooting tips
- Status tracking procedures
- CI/CD integration examples
- Best practices and common issues

The Forms module serves as a reference implementation of this testing framework.

## Quick Links

- **Test Status Tracker**: [Forms_Test_Status.md](./Forms_Test_Status.md)
- **Manual Tests**: [manual_tests/](./manual_tests/)
- **Playwright Tests**: [../../playwright_tests/forms/](../../playwright_tests/forms/)
- **Testing Skill**: [.claude/skills/testing.md](../../../.claude/skills/testing.md)

## Maintenance

When form functionality changes:
1. Update affected test scenarios
2. Modify both manual and automated tests
3. Update the status tracker
4. Re-execute tests to verify changes
5. Update this README if structure changes

## Support

For questions or issues with testing:
- Use the `testing` skill: `/skill testing`
- Check the Playwright docs: https://playwright.dev/
- Consult the project testing guidelines: `/project-guidelines`

---

Last Updated: 2025-11-17
Version: 1.0.0
