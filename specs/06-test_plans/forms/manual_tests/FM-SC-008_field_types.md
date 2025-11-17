# FM-SC-008: Form Field Type Validation

## Scenario Title
Test various form field types to ensure each type behaves correctly and validates data appropriately.

## Prerequisites
- User is logged into the CRM application
- User has permissions to create and configure forms
- User can access the form builder interface

## Test Steps

1. Create a new form named "Field Type Testing Form"
2. Add and test each field type:

### Text Input Field
3. Add a "Text Input" field with label "Full Name"
4. Set max length to 100 characters
5. Mark as required
6. Test submission with valid text
7. Test with text exceeding 100 characters
8. Verify max length validation works

### Email Field
9. Add an "Email" field with label "Contact Email"
10. Mark as required
11. Test with valid email: "test@example.com"
12. Test with invalid formats:
    - "notanemail"
    - "missing@domain"
    - "@nodomain.com"
13. Verify email format validation for each case

### Number Field
14. Add a "Number" field with label "Age"
15. Set min value to 18, max value to 120
16. Test with valid number: 25
17. Test with number below min: 10
18. Test with number above max: 150
19. Test with non-numeric input: "abc"
20. Verify all validation rules work correctly

### Date Field
21. Add a "Date" field with label "Appointment Date"
22. Set date picker format
23. Test selecting a date from the picker
24. Test entering a date manually (if allowed)
25. Test with invalid date format
26. Verify date is stored in correct format

### Dropdown/Select Field
27. Add a "Dropdown" field with label "Country"
28. Add options: "USA", "Canada", "UK", "Australia", "Other"
29. Mark as required
30. Test selecting each option
31. Test submission without selection
32. Verify required validation works

### Checkbox Field
33. Add a "Checkbox" field with label "Terms and Conditions"
34. Mark as required
35. Test checking the box
36. Test submission without checking
37. Verify required validation for checkbox

### Radio Button Field
38. Add a "Radio Button" field with label "Preferred Contact Method"
39. Add options: "Email", "Phone", "SMS"
40. Mark as required
41. Test selecting each option
42. Test submission without selection
43. Verify only one option can be selected at a time

### Textarea Field
44. Add a "Textarea" field with label "Additional Comments"
45. Set min length to 20, max length to 500
46. Test with valid text meeting requirements
47. Test with text under 20 characters
48. Test with text over 500 characters
49. Verify character count display if available

### File Upload Field
50. Add a "File Upload" field with label "Resume"
51. Set allowed file types: PDF, DOC, DOCX
52. Set max file size: 5MB
53. Test uploading a valid PDF file
54. Test uploading invalid file type (e.g., .exe)
55. Test uploading file exceeding size limit
56. Verify file validation and upload success

## Expected Result
- All field types can be added successfully
- Each field type displays appropriate input control
- Text fields enforce max length constraints
- Email fields validate correct email format
- Number fields validate numeric input and range
- Date fields provide date picker and validate format
- Dropdown fields show all options and validate selection
- Checkboxes validate required state correctly
- Radio buttons allow single selection and validate requirement
- Textarea fields enforce character limits
- File upload validates file type and size
- Appropriate error messages display for each validation failure
- Valid data for all field types can be submitted successfully
- Form saves all field type data correctly

## Test Data

**Valid Data Set:**
- Full Name: "John Smith"
- Contact Email: "john.smith@example.com"
- Age: 30
- Appointment Date: "2025-12-15"
- Country: "USA"
- Terms and Conditions: Checked
- Preferred Contact Method: "Email"
- Additional Comments: "Looking forward to discussing the opportunity in detail."
- Resume: valid_resume.pdf (2MB, PDF format)

**Invalid Data Set:**
- Full Name: [String with 150 characters]
- Contact Email: "notanemail"
- Age: 15 (below minimum)
- Country: [Not selected]
- Terms and Conditions: Unchecked
- Preferred Contact Method: [Not selected]
- Additional Comments: "Short text" (less than 20 chars)
- Resume: malware.exe (invalid file type)

## Notes
- Test field types that are specific to your form builder implementation
- Verify that custom field types (if any) work as expected
- Check that field validation is consistent across all browsers
- Ensure error messages are clear and helpful for each field type
- Test accessibility features (keyboard navigation, screen reader support)
- Verify that conditional logic/dependencies between fields work if implemented
