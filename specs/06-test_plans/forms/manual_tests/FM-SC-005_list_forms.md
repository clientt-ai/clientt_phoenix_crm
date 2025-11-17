# FM-SC-005: View and List All Forms

## Scenario Title
Navigate to the Forms listing page and verify all forms are displayed with correct information.

## Prerequisites
- User is logged into the CRM application
- Multiple forms exist in the system (at least 3-5 forms)
- User has permissions to view forms
- User is on the main dashboard or navigation area

## Test Steps

1. Navigate to the Forms section from the main navigation menu
2. Verify the Forms listing page loads successfully
3. Observe the list or grid of forms displayed
4. Check that each form card/row displays:
   - Form name
   - Form description (if applicable)
   - Form status (Draft, Active, Archived, etc.)
   - Creation date
   - Last modified date
   - Number of submissions (if applicable)
   - Actions menu (Edit, Delete, View, etc.)
5. Verify forms are sorted correctly (e.g., by creation date, alphabetically)
6. Test pagination if more forms exist than the page limit:
   - Navigate to page 2
   - Verify different forms are displayed
   - Navigate back to page 1
7. Test search functionality (if available):
   - Enter a form name in the search box
   - Verify filtered results match the search term
   - Clear search and verify all forms are displayed again
8. Test filter functionality (if available):
   - Filter by status (e.g., "Active" only)
   - Verify only matching forms are displayed
   - Clear filter
9. Click on a form to view its details
10. Verify form details page displays correct information
11. Return to the Forms listing page

## Expected Result
- Forms listing page loads without errors
- All forms in the system are accessible from this page
- Each form displays accurate information (name, status, dates)
- Forms are properly organized and sorted
- Pagination works correctly if applicable
- Search functionality filters forms accurately
- Filter options work as expected
- Clicking a form navigates to its detail or edit page
- User can easily identify and access any form
- Page displays empty state message if no forms exist

## Test Data
Verify the following forms appear (or similar):
- "Customer Feedback Form" (Active)
- "Employee Onboarding Form" (Draft)
- "Product Survey Form" (Active)
- "Support Request Form" (Active)
- "Partnership Application" (Draft)

## Notes
- Verify that forms created by different users are visible based on permissions
- Check that archived or deleted forms are handled appropriately
- Test that submission counts are accurate
- Ensure proper handling of forms with long names or descriptions
