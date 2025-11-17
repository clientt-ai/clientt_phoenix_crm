# FM-SC-003: Submit Form with Valid Data

## Scenario Title
Fill out a form with valid data in all required fields and submit successfully.

## Prerequisites
- User is logged into the CRM application
- A form exists with configured fields (can use FM-SC-002 to configure)
- Form is published or in "Active" status
- User has permissions to submit forms
- User is on the Form submission page or public form URL

## Test Steps

1. Navigate to the form submission page for "Customer Feedback Form"
2. Verify all form fields are displayed correctly
3. Fill in the "Full Name" field with valid text (e.g., "John Smith")
4. Fill in the "Email Address" field with a valid email (e.g., "john.smith@example.com")
5. Select an option from the "Product Category" dropdown (e.g., "Electronics")
6. Fill in the "Feedback Comments" textarea with text longer than 10 characters (e.g., "The product quality is excellent and exceeded my expectations.")
7. Enter a number in the "Rating (1-10)" field within the valid range (e.g., "8")
8. Review all entered data for accuracy
9. Click the "Submit" button
10. Observe the submission confirmation message or page
11. Verify that the form data is saved in the system
12. Check that a submission record appears in the form submissions list

## Expected Result
- All form fields accept valid input without errors
- Submit button is enabled after all required fields are filled
- Form submits successfully without validation errors
- User sees a success confirmation message (e.g., "Form submitted successfully")
- Submission is recorded in the system with correct data
- Submission appears in the forms submissions dashboard with timestamp
- User receives confirmation email if configured

## Test Data
- **Full Name**: "John Smith"
- **Email Address**: "john.smith@example.com"
- **Product Category**: "Electronics"
- **Feedback Comments**: "The product quality is excellent and exceeded my expectations."
- **Rating**: 8

## Notes
- Verify that submission timestamp is recorded accurately
- Check that all field values are stored correctly in the database
- Ensure email notifications are sent if configured
- Test that form can be submitted multiple times if not restricted
