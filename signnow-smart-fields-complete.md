# Complete SignNow Smart Fields Configuration

## Template Information
- **Template ID**: `e7ba8b894c644999a7b38037ea66f4cc9cc524f5`
- **Total Fields**: 23 smart fields
- **Format**: Snake_case (lowercase with underscores)

## All SignNow Smart Fields

### Personal Information Fields (10 fields)
1. `first_name` - Applicant's first name
2. `last_name` - Applicant's last name  
3. `email` - Applicant's email address
4. `phone` - Applicant's phone number
5. `date_of_birth` - Applicant's date of birth
6. `ssn` - Social Security Number (optional)
7. `personal_address` - Applicant's home address
8. `personal_city` - Applicant's city
9. `personal_state` - Applicant's state/province
10. `personal_zip` - Applicant's postal code

### Business Information Fields (8 fields)
11. `business_name` - Business operating name (DBA)
12. `legal_business_name` - Legal business name
13. `business_address` - Business street address
14. `business_city` - Business city
15. `business_state` - Business state/province
16. `business_zip` - Business postal code
17. `business_phone` - Business phone number
18. `business_website` - Business website URL

### Loan Information Fields (3 fields)
19. `amount_requested` - Loan amount requested
20. `purpose_of_funds` - How funds will be used
21. `industry` - Business industry/location

### Additional Fields (2 fields)
22. `ownership_percentage` - Ownership percentage in business
23. `credit_score` - Personal credit score

## Field Mapping Source Code Location
**File**: `client/src/routes/Step4_ApplicantInfo_Complete.tsx`
**Lines**: 255-287

## Usage Notes
- All field names use snake_case format (lowercase with underscores)
- Fields are populated from Steps 1, 3, and 4 of the application
- These exact field names must match your SignNow template configuration
- The `ssn` field is optional and can be left blank
- Template verification should ensure all 23 field names match exactly