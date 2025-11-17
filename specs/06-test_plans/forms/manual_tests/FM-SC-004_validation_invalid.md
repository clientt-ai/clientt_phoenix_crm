# FM-SC-004: Form Validation with Invalid Data

## Scenario Title
Attempt to submit a form with invalid or missing data and verify validation errors are displayed.

## Prerequisites
- User is logged into the CRM application
- A form exists with configured validation rules (can use FM-SC-002 to configure)
- Form is published or in "Active" status
- User is on the Form submission page

## Test Steps

1. Navigate to the form submission page for "Customer Feedback Form"
2. **Test Case 1: Empty required fields**
   - Leave all fields empty
   - Click "Submit" button
   - Verify validation error messages appear for all required fields
3. **Test Case 2: Invalid email format**
   - Fill in "Full Name" with "Jane Doe"
   - Enter invalid email format in "Email Address" (e.g., "invalidemail")
   - Click "Submit" button
   - Verify email validation error appears (e.g., "Please enter a valid email address")
4. **Test Case 3: Textarea below minimum length**
   - Fill in "Full Name" with "Jane Doe"
   - Fill in "Email Address" with "jane@example.com"
   - Select "Clothing" from "Product Category" dropdown
   - Enter short text in "Feedback Comments" (e.g., "Good")
   - Click "Submit" button
   - Verify validation error for minimum character requirement (e.g., "Minimum 10 characters required")
5. **Test Case 4: Number outside valid range**
   - Fill in all fields correctly except rating
   - Enter "15" in "Rating (1-10)" field (above maximum)
   - Click "Submit" button
   - Verify validation error for range (e.g., "Value must be between 1 and 10")
6. **Test Case 5: Number below minimum range**
   - Correct the rating field
   - Enter "0" in "Rating (1-10)" field (below minimum)
   - Click "Submit" button
   - Verify validation error for range (e.g., "Value must be between 1 and 10")
7. Verify that form is NOT submitted in any of the above cases
8. Fill in all fields with valid data and verify successful submission works

## Expected Result
- Form displays appropriate validation error messages for each validation failure
- Error messages are clear and specific to the validation rule violated
- Form does NOT submit when validation fails
- Required field indicators are visible
- Email field shows format validation error for invalid emails
- Textarea shows character count/minimum requirement error
- Number field shows range validation errors
- Multiple validation errors can be displayed simultaneously
- Form can be successfully submitted after correcting all validation errors

## Test Data

**Test Case 1 (Empty):**
- All fields: Empty

**Test Case 2 (Invalid Email):**
- Full Name: "Jane Doe"
- Email: "invalidemail"

**Test Case 3 (Short Text):**
- Full Name: "Jane Doe"
- Email: "jane@example.com"
- Product Category: "Clothing"
- Feedback Comments: "Good" (less than 10 chars)

**Test Case 4 (High Rating):**
- All fields valid except Rating: "15"

**Test Case 5 (Low Rating):**
- All fields valid except Rating: "0"

**Valid Data (Final Test):**
- Full Name: "Jane Doe"
- Email: "jane@example.com"
- Product Category: "Clothing"
- Feedback Comments: "Great quality and fast shipping!"
- Rating: 9

## Notes
- Verify error messages disappear when fields are corrected
- Check that validation occurs on submit and/or on field blur
- Ensure validation is consistent between client-side and server-side
- Test that special characters in text fields are handled properly
