# FM-SC-007: Delete Form

## Scenario Title
Delete an existing form and verify it is removed from the system.

## Prerequisites
- User is logged into the CRM application
- At least one form exists that can be deleted
- User has permissions to delete forms
- User is on the Forms listing page

## Test Steps

1. Navigate to the Forms listing page
2. Locate a form that can be deleted (e.g., a test form or draft form)
3. Note the current total count of forms displayed
4. Click the "Delete" button or icon for the selected form
5. Verify that a confirmation dialog appears with:
   - Warning message about deletion
   - Information about consequences (e.g., "This will also delete all submissions")
   - "Cancel" and "Delete" or "Confirm" buttons
6. Click "Cancel" button first to test cancellation
7. Verify the form is NOT deleted and dialog closes
8. Click the "Delete" button again to reopen the confirmation
9. Click "Delete" or "Confirm" button to proceed with deletion
10. Observe the success notification message
11. Verify the form is removed from the Forms listing
12. Check that the total count of forms has decreased by 1
13. Attempt to search for the deleted form by name
14. Verify the form does not appear in search results
15. If applicable, check that the form's URL returns a 404 or "Form not found" error

## Expected Result
- Delete button/icon is visible and accessible
- Confirmation dialog appears before deletion
- Dialog clearly warns about deletion consequences
- Canceling the deletion keeps the form intact
- Confirming deletion removes the form from the system
- Success message confirms deletion (e.g., "Form deleted successfully")
- Form no longer appears in the Forms listing
- Form cannot be accessed via direct URL
- Related data (submissions) handling is appropriate based on system design
- Total form count is updated correctly

## Test Data
- Form to delete: "Test Form" or any non-critical form
- Verify form has name/ID for reference: e.g., "Product Survey Draft"

## Notes
- **Important**: Do not delete forms with critical data or active submissions unless testing in a safe environment
- Verify that soft delete vs. hard delete behavior matches system requirements
- Check if deleted forms can be recovered (if trash/archive feature exists)
- Test that associated submissions are handled per business rules (deleted, archived, or orphaned prevention)
- Ensure deletion is logged in audit trail if applicable
- Verify that permissions properly restrict deletion for unauthorized users
