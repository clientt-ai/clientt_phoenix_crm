# FM-SC-002: Configure Form Fields and Validation

## Scenario Title
Add multiple field types to a form and configure their validation rules.

## Prerequisites
- User is logged into the CRM application
- A form exists and is accessible (can use FM-SC-001 to create one)
- User has permissions to edit forms
- User is on the Form Builder or Form Editor page

## Test Steps

1. Navigate to an existing form (e.g., "Customer Feedback Form")
2. Click "Edit" or "Configure Fields" to enter the form builder
3. Add a "Text Input" field:
   - Click "Add Field" button
   - Select "Text Input" field type
   - Set label as "Full Name"
   - Mark as "Required"
   - Click "Save Field" or "Add"
4. Add an "Email" field:
   - Click "Add Field" button
   - Select "Email" field type
   - Set label as "Email Address"
   - Mark as "Required"
   - Enable email format validation
   - Click "Save Field" or "Add"
5. Add a "Dropdown" field:
   - Click "Add Field" button
   - Select "Dropdown" or "Select" field type
   - Set label as "Product Category"
   - Add options: "Electronics", "Clothing", "Home & Garden", "Other"
   - Mark as "Required"
   - Click "Save Field" or "Add"
6. Add a "Textarea" field:
   - Click "Add Field" button
   - Select "Textarea" field type
   - Set label as "Feedback Comments"
   - Set minimum character length to 10
   - Mark as "Required"
   - Click "Save Field" or "Add"
7. Add a "Number" field:
   - Click "Add Field" button
   - Select "Number" field type
   - Set label as "Rating (1-10)"
   - Set minimum value to 1
   - Set maximum value to 10
   - Mark as "Required"
   - Click "Save Field" or "Add"
8. Review all added fields in the form builder
9. Click "Save Form" or "Update Form" button
10. Verify success notification appears

## Expected Result
- All five fields are successfully added to the form
- Each field displays with its configured label and type
- Validation rules are saved for each field
- Form builder shows all fields in the correct order
- Success message confirms form configuration was saved
- Fields appear in the correct sequence when previewing the form

## Test Data
- **Text Field**: "Full Name" (Required)
- **Email Field**: "Email Address" (Required, Email format)
- **Dropdown**: "Product Category" with options (Required)
- **Textarea**: "Feedback Comments" (Required, Min 10 chars)
- **Number**: "Rating (1-10)" (Required, Range 1-10)

## Notes
- Verify that field reordering works if the feature is available
- Test field deletion and editing capabilities
- Ensure validation rules are properly saved and can be edited later
