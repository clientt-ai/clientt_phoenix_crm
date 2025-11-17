# FM-SC-006: Edit Existing Form

## Scenario Title
Edit an existing form's basic information and field configuration, then save the changes.

## Prerequisites
- User is logged into the CRM application
- At least one form exists (can use FM-SC-001 to create)
- User has permissions to edit forms
- User is on the Forms listing page

## Test Steps

1. Navigate to the Forms listing page
2. Locate the form to be edited (e.g., "Customer Feedback Form")
3. Click the "Edit" button or icon for the selected form
4. Verify the form edit page loads with current form data pre-filled
5. **Edit basic form information:**
   - Change the form name (e.g., from "Customer Feedback Form" to "Customer Feedback Survey")
   - Update the form description
   - Change the status if applicable (e.g., from "Draft" to "Active")
6. **Edit form fields:**
   - Click on an existing field to edit it
   - Change the "Full Name" field label to "Customer Name"
   - Update the field's help text or placeholder
   - Save the field changes
7. **Remove a field:**
   - Select the "Rating (1-10)" field
   - Click "Delete" or "Remove" field button
   - Confirm the deletion in the confirmation dialog
8. **Add a new field:**
   - Click "Add Field" button
   - Select "Checkbox" field type
   - Set label as "Subscribe to Newsletter"
   - Mark as "Optional" (not required)
   - Save the field
9. **Reorder fields** (if available):
   - Drag the "Email Address" field to appear after "Customer Name"
   - Verify field order updates
10. Review all changes made to the form
11. Click "Save Changes" or "Update Form" button
12. Verify success message appears
13. Navigate back to the Forms listing
14. Verify the form displays with the updated name
15. Open the form again to confirm all changes were saved

## Expected Result
- Form edit page loads with all current data pre-populated
- Form name can be updated successfully
- Form description and status can be modified
- Existing fields can be edited and changes are saved
- Fields can be deleted with confirmation
- New fields can be added to the form
- Field reordering works correctly if available
- All changes are saved when "Update Form" is clicked
- Success message confirms the update
- Updated form appears in the listing with new name
- Re-opening the form shows all saved changes
- Form maintains its unique identifier despite name change

## Test Data

**Original Form:**
- Name: "Customer Feedback Form"
- Description: "Collect customer feedback on product experience"
- Status: "Draft"

**Updated Form:**
- Name: "Customer Feedback Survey"
- Description: "Comprehensive customer feedback and satisfaction survey"
- Status: "Active"

**Field Changes:**
- "Full Name" → "Customer Name"
- Remove: "Rating (1-10)" field
- Add: "Subscribe to Newsletter" (Checkbox, Optional)

## Notes
- Verify that editing doesn't affect existing form submissions
- Check that form version history is maintained if applicable
- Ensure field deletions show appropriate warnings if data exists
- Test that unique constraints (e.g., form name) are enforced during edits
