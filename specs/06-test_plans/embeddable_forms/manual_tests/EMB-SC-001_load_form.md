# EMB-SC-001: Load Embeddable Form on External Page

## Test Objective

Verify that the Clientt embeddable form widget can be successfully loaded and rendered on an external website, with proper error handling and CSS customization support.

## Prerequisites

1. Phoenix server running at `http://localhost:4002`
2. At least one published form exists in the database
3. Access to an HTML page (can use `playwright_tests/tests/modules/embeddable_forms/test-page.html`)

## Test Data

- **Valid Form ID**: Use a published form UUID from the database
- **Invalid Form ID**: `invalid-uuid-12345`
- **Test Page CSS Variables**:
  ```css
  :root {
    --clientt-primary-color: #FF5722;
    --clientt-font-family: 'Segoe UI', sans-serif;
  }
  ```

---

## Test Cases

### TC-001: Load Embed Script Successfully

**Description**: Verify the embed script loads and registers the custom element.

**Steps**:
1. Create an HTML page with the following content:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <script src="http://localhost:4002/embed/clientt-forms.js"></script>
   </head>
   <body>
     <div id="form-container"></div>
   </body>
   </html>
   ```
2. Open the page in a browser
3. Open browser DevTools (F12)
4. In Console, run: `customElements.get('clientt-form')`

**Expected Result**:
- Script loads without errors
- Console returns the ClienttForm class definition (not `undefined`)

---

### TC-002: Show Error for Missing form-id Attribute

**Description**: Verify appropriate error when form-id is not provided.

**Steps**:
1. Add the embed script to an HTML page
2. Add `<clientt-form></clientt-form>` without the form-id attribute
3. Observe the rendered output

**Expected Result**:
- Red error box appears with message: "Form ID is required"
- No JavaScript errors in console

---

### TC-003: Show Error for Invalid Form ID

**Description**: Verify error handling for non-existent form IDs.

**Steps**:
1. Add the embed script to an HTML page
2. Add `<clientt-form form-id="invalid-uuid-12345"></clientt-form>`
3. Wait for the API request to complete

**Expected Result**:
- Loading spinner appears briefly
- Red error box appears with message: "Form not found"

---

### TC-004: Display Loading Spinner

**Description**: Verify loading state is shown while fetching form data.

**Steps**:
1. Add the embed script to an HTML page
2. Add `<clientt-form form-id="any-uuid"></clientt-form>`
3. Observe immediately after the element is added

**Expected Result**:
- Animated spinner appears in the form container
- Spinner uses the configured primary color

---

### TC-005: Inject Styles into Document Head

**Description**: Verify CSS styles are properly injected.

**Steps**:
1. Add the embed script to an HTML page
2. Add a `<clientt-form>` element
3. Inspect the `<head>` element in DevTools

**Expected Result**:
- `<style id="clientt-form-styles">` element exists in head
- Style content includes `.clientt-form`, `--clientt-primary-color`, etc.
- Styles only injected once (no duplicates)

---

### TC-006: Apply Custom CSS Variables from Host Page

**Description**: Verify the widget respects host page CSS variables.

**Steps**:
1. Create an HTML page with custom CSS variables:
   ```html
   <style>
     :root {
       --clientt-primary-color: #FF5722;
       --clientt-font-family: 'Georgia', serif;
       --clientt-border-color: #000000;
     }
   </style>
   ```
2. Add the embed script and a form element
3. Inspect the form button styling

**Expected Result**:
- Submit button uses `#FF5722` as background color
- Form uses Georgia font family
- Input borders use black color

---

### TC-007: Load and Render Published Form

**Description**: Verify a real published form loads and displays correctly.

**Steps**:
1. Get a published form ID from the database:
   ```sql
   SELECT id, name FROM forms_forms WHERE status = 'published' LIMIT 1;
   ```
2. Add the form to an HTML page:
   ```html
   <clientt-form form-id="<your-form-uuid>"></clientt-form>
   ```
3. Wait for form to load

**Expected Result**:
- Form title and description display
- All form fields render in correct order
- Field labels show required indicator (*) where applicable
- Submit button is visible and enabled

---

### TC-008: Render Layout Elements (Heading, Separator, Spacer)

**Description**: Verify layout elements render correctly.

**Steps**:
1. Create a form with heading, separator, and spacer fields
2. Publish the form
3. Embed the form on an external page

**Expected Result**:
- Heading renders as `<h3>` with specified text
- Separator renders as horizontal rule (`<hr>`)
- Spacer adds vertical spacing between fields

---

## Test Environment

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | Primary |
| Firefox | Latest | Secondary |
| Safari | Latest | Secondary |
| Edge | Latest | Secondary |

## Automation

This test scenario is automated in:
```
playwright_tests/tests/modules/embeddable_forms/EMB-SC-001_load_form/test.spec.js
```

Run with:
```bash
npx playwright test tests/modules/embeddable_forms/EMB-SC-001_load_form/
```

## Related Tests

- EMB-SC-002: Submit Form Successfully
- EMB-SC-003: Multi-Step Form Navigation
- FM-SC-003: Submit Form with Valid Data

---

Last Updated: 2025-11-21
Version: 1.0.0
