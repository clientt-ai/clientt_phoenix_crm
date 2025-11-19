# Playwright Tests Index

## Quick Commands

```bash
# Run all tests
npx playwright test --project=chromium

# Run specific test file
npx playwright test <file> --project=chromium

# Run specific test by line number
npx playwright test <file>:<line> --project=chromium

# Run tests matching pattern
npx playwright test -g "pattern" --project=chromium

# Show HTML report
npx playwright show-report
```

---

## Screenshot Capture Tests

**File:** `capture_screenshots.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 16 | 01 - Sign In Page | `npx playwright test capture_screenshots.spec.js:16 --project=chromium` |
| 25 | 02 - Registration Page | `npx playwright test capture_screenshots.spec.js:25 --project=chromium` |
| 34 | 03 - Home Page | `npx playwright test capture_screenshots.spec.js:34 --project=chromium` |
| 43 | 04 - Password Reset Page | `npx playwright test capture_screenshots.spec.js:43 --project=chromium` |
| 52 | 05 - Login and Capture Forms Listing | `npx playwright test capture_screenshots.spec.js:52 --project=chromium` |
| 76 | 06 - Form Builder (New Form) | `npx playwright test capture_screenshots.spec.js:76 --project=chromium` |
| 100 | 07 - Form Builder with Created Form | `npx playwright test capture_screenshots.spec.js:100 --project=chromium` |
| 148 | 08 - Form with Fields Added | `npx playwright test capture_screenshots.spec.js:148 --project=chromium` |

**Run all:** `npx playwright test capture_screenshots.spec.js --project=chromium`

---

## Form Tests

### FM-SC-001: Create New Form Successfully

**File:** `forms/FM-SC-001_create_form/test.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 46 | should create a new form with valid data | `npx playwright test forms/FM-SC-001_create_form/test.spec.js:46 --project=chromium` |
| 112 | should validate required fields when creating form | `npx playwright test forms/FM-SC-001_create_form/test.spec.js:112 --project=chromium` |
| 128 | should handle form name uniqueness validation | `npx playwright test forms/FM-SC-001_create_form/test.spec.js:128 --project=chromium` |

**Run all:** `npx playwright test forms/FM-SC-001_create_form --project=chromium`

---

### FM-SC-002: Configure Form Fields and Validation

**File:** `forms/FM-SC-002_configure_fields/test.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 69 | should add text input field with validation | `npx playwright test forms/FM-SC-002_configure_fields/test.spec.js:69 --project=chromium` |
| 95 | should add email field | `npx playwright test forms/FM-SC-002_configure_fields/test.spec.js:95 --project=chromium` |
| 118 | should add dropdown field with options | `npx playwright test forms/FM-SC-002_configure_fields/test.spec.js:118 --project=chromium` |
| 143 | should add textarea field | `npx playwright test forms/FM-SC-002_configure_fields/test.spec.js:143 --project=chromium` |
| 165 | should add number field | `npx playwright test forms/FM-SC-002_configure_fields/test.spec.js:165 --project=chromium` |
| 187 | should configure multiple fields in sequence | `npx playwright test forms/FM-SC-002_configure_fields/test.spec.js:187 --project=chromium` |

**Run all:** `npx playwright test forms/FM-SC-002_configure_fields --project=chromium`

---

### FM-SC-003: Form Creation with Fields

**File:** `forms/FM-SC-003_submit_valid/test.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 45 | should create form with fields for future submission testing | `npx playwright test forms/FM-SC-003_submit_valid/test.spec.js:45 --project=chromium` |
| 89 | should publish form for submission | `npx playwright test forms/FM-SC-003_submit_valid/test.spec.js:89 --project=chromium` |
| 126 | should display form preview with all fields | `npx playwright test forms/FM-SC-003_submit_valid/test.spec.js:126 --project=chromium` |

**Run all:** `npx playwright test forms/FM-SC-003_submit_valid --project=chromium`

---

### FM-SC-004: Form Builder Validation

**File:** `forms/FM-SC-004_validation_invalid/test.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 44 | should show error when form name is empty | `npx playwright test forms/FM-SC-004_validation_invalid/test.spec.js:44 --project=chromium` |
| 61 | should show error for duplicate form name | `npx playwright test forms/FM-SC-004_validation_invalid/test.spec.js:61 --project=chromium` |
| 96 | should require field label when adding field | `npx playwright test forms/FM-SC-004_validation_invalid/test.spec.js:96 --project=chromium` |
| 124 | should validate field configuration for select type | `npx playwright test forms/FM-SC-004_validation_invalid/test.spec.js:124 --project=chromium` |
| 151 | should successfully create form after fixing validation errors | `npx playwright test forms/FM-SC-004_validation_invalid/test.spec.js:151 --project=chromium` |
| 181 | should clear error when field is corrected | `npx playwright test forms/FM-SC-004_validation_invalid/test.spec.js:181 --project=chromium` |
| 203 | should handle special characters in form name | `npx playwright test forms/FM-SC-004_validation_invalid/test.spec.js:203 --project=chromium` |

**Run all:** `npx playwright test forms/FM-SC-004_validation_invalid --project=chromium`

---

### FM-SC-005: View and List All Forms

**File:** `forms/FM-SC-005_list_forms/test.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 46 | should display forms listing page successfully | `npx playwright test forms/FM-SC-005_list_forms/test.spec.js:46 --project=chromium` |
| 65 | should display existing forms in the table | `npx playwright test forms/FM-SC-005_list_forms/test.spec.js:65 --project=chromium` |
| 97 | should navigate to form builder when clicking Create Form | `npx playwright test forms/FM-SC-005_list_forms/test.spec.js:97 --project=chromium` |
| 108 | should navigate to form edit when clicking Edit link | `npx playwright test forms/FM-SC-005_list_forms/test.spec.js:108 --project=chromium` |

**Run all:** `npx playwright test forms/FM-SC-005_list_forms --project=chromium`

---

### FM-SC-006: Edit Existing Form

**File:** `forms/FM-SC-006_edit_form/test.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 91 | should load form edit page with pre-filled data | `npx playwright test forms/FM-SC-006_edit_form/test.spec.js:91 --project=chromium` |
| 111 | should edit basic form information | `npx playwright test forms/FM-SC-006_edit_form/test.spec.js:111 --project=chromium` |
| 134 | should edit existing form field | `npx playwright test forms/FM-SC-006_edit_form/test.spec.js:134 --project=chromium` |
| 160 | should remove a field from the form | `npx playwright test forms/FM-SC-006_edit_form/test.spec.js:160 --project=chromium` |
| 184 | should add a new field to existing form | `npx playwright test forms/FM-SC-006_edit_form/test.spec.js:184 --project=chromium` |
| 208 | should maintain form ID when editing name | `npx playwright test forms/FM-SC-006_edit_form/test.spec.js:208 --project=chromium` |
| 229 | should navigate from listing to edit and back | `npx playwright test forms/FM-SC-006_edit_form/test.spec.js:229 --project=chromium` |
| 255 | should update multiple fields in sequence | `npx playwright test forms/FM-SC-006_edit_form/test.spec.js:255 --project=chromium` |

**Run all:** `npx playwright test forms/FM-SC-006_edit_form --project=chromium`

---

### FM-SC-007: Delete Form Fields

**File:** `forms/FM-SC-007_delete_form/test.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 85 | should display delete button on form fields | `npx playwright test forms/FM-SC-007_delete_form/test.spec.js:85 --project=chromium` |
| 95 | should show confirmation dialog when deleting field | `npx playwright test forms/FM-SC-007_delete_form/test.spec.js:95 --project=chromium` |
| 115 | should cancel deletion when dismissing confirmation | `npx playwright test forms/FM-SC-007_delete_form/test.spec.js:115 --project=chromium` |
| 141 | should successfully delete field when confirmed | `npx playwright test forms/FM-SC-007_delete_form/test.spec.js:141 --project=chromium` |
| 167 | should delete multiple fields in sequence | `npx playwright test forms/FM-SC-007_delete_form/test.spec.js:167 --project=chromium` |
| 192 | should persist deletion after page reload | `npx playwright test forms/FM-SC-007_delete_form/test.spec.js:192 --project=chromium` |
| 218 | should show empty state when all fields deleted | `npx playwright test forms/FM-SC-007_delete_form/test.spec.js:218 --project=chromium` |
| 243 | should still have add field button after deletion | `npx playwright test forms/FM-SC-007_delete_form/test.spec.js:243 --project=chromium` |

**Run all:** `npx playwright test forms/FM-SC-007_delete_form --project=chromium`

---

### FM-SC-008: Form Field Type Configuration

**File:** `forms/FM-SC-008_field_types/test.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 71 | should add Text Input field | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:71 --project=chromium` |
| 91 | should add Email field | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:91 --project=chromium` |
| 108 | should add Number field | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:108 --project=chromium` |
| 125 | should add Date field | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:125 --project=chromium` |
| 141 | should add Select Dropdown field with options | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:141 --project=chromium` |
| 162 | should add Checkbox field | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:162 --project=chromium` |
| 179 | should add Radio Button field with options | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:179 --project=chromium` |
| 200 | should add Textarea field | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:200 --project=chromium` |
| 217 | should add Phone field | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:217 --project=chromium` |
| 233 | should add URL field | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:233 --project=chromium` |
| 250 | should add all field types to single form | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:250 --project=chromium` |
| 287 | should show correct field type in preview | `npx playwright test forms/FM-SC-008_field_types/test.spec.js:287 --project=chromium` |

**Run all:** `npx playwright test forms/FM-SC-008_field_types --project=chromium`

---

## Feature Tests

### Authentication

**File:** `tests/features/authentication.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 15 | should allow a new user to register with valid credentials | `npx playwright test tests/features/authentication.spec.js:15 --project=chromium` |
| 37 | should show validation errors for invalid email format | `npx playwright test tests/features/authentication.spec.js:37 --project=chromium` |
| 57 | should allow a user to login with valid credentials | `npx playwright test tests/features/authentication.spec.js:57 --project=chromium` |
| 78 | should show error for invalid credentials | `npx playwright test tests/features/authentication.spec.js:78 --project=chromium` |
| 96 | should allow a logged-in user to logout | `npx playwright test tests/features/authentication.spec.js:96 --project=chromium` |
| 117 | should allow a user to request a password reset | `npx playwright test tests/features/authentication.spec.js:117 --project=chromium` |

**Run all:** `npx playwright test tests/features/authentication.spec.js --project=chromium`

---

### Navigation

**File:** `tests/features/navigation.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 14 | should load the home page successfully | `npx playwright test tests/features/navigation.spec.js:14 --project=chromium` |
| 23 | should access the sign-in page | `npx playwright test tests/features/navigation.spec.js:23 --project=chromium` |
| 48 | should navigate to dashboard after login | `npx playwright test tests/features/navigation.spec.js:48 --project=chromium` |
| 53 | should be able to access protected routes | `npx playwright test tests/features/navigation.spec.js:53 --project=chromium` |
| 75 | should redirect to sign-in when accessing protected routes | `npx playwright test tests/features/navigation.spec.js:75 --project=chromium` |
| 90 | should display mobile menu on small screens | `npx playwright test tests/features/navigation.spec.js:90 --project=chromium` |

**Run all:** `npx playwright test tests/features/navigation.spec.js --project=chromium`

---

## Example Tests

### Page Object Model

**File:** `tests/examples/using-page-objects.spec.js`

| Line | Test Name | Command |
|------|-----------|---------|
| 14 | should login using page object | `npx playwright test tests/examples/using-page-objects.spec.js:14 --project=chromium` |
| 28 | should show error for invalid credentials using page object | `npx playwright test tests/examples/using-page-objects.spec.js:28 --project=chromium` |

**Run all:** `npx playwright test tests/examples/using-page-objects.spec.js --project=chromium`

---

## Debug Tests

| File | Test | Command |
|------|------|---------|
| `debug_auth.spec.js` | check form field names and cookies | `npx playwright test debug_auth.spec.js --project=chromium` |
| `debug_company_auth.spec.js` | check company assignment and LiveView mount | `npx playwright test debug_company_auth.spec.js --project=chromium` |
| `debug_liveview_connection.spec.js` | check if LiveView socket connects | `npx playwright test debug_liveview_connection.spec.js --project=chromium` |
| `debug_manual_flow.spec.js` | simulate exact manual user flow | `npx playwright test debug_manual_flow.spec.js --project=chromium` |

---

## Bulk Commands

```bash
# Run all form tests
npx playwright test forms/ --project=chromium

# Run all feature tests
npx playwright test tests/features/ --project=chromium

# Run all tests except debug
npx playwright test --ignore-pattern="debug_*.spec.js" --project=chromium

# Run tests in headed mode (see browser)
npx playwright test --headed --project=chromium

# Run with specific timeout
npx playwright test --timeout=60000 --project=chromium
```

---

## Test Summary

| Category | Count |
|----------|-------|
| Screenshot Capture | 8 |
| Form Tests (FM-SC-001 to 008) | 51 |
| Feature Tests | 12 |
| Example Tests | 2 |
| Debug Tests | 5 |
| **Total** | **78** |
