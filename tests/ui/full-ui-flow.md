# Full UI Flow Tests (Staff-Portal)

## Scope
UI validation for the staff portal flows across silos without altering logic.

## Test Cases
- **Login & MFA validation**: Confirm credentials, MFA challenge, and session persistence.
- **Silo switching test (BF / BI / SLF)**: Validate silo toggle updates data scopes and UI labels.
- **Dashboard render test**: Ensure widgets/cards render with accurate counts and links.
- **Sales pipeline column tests**: Verify pipeline columns load correct stages, sorting, and filtering.
- **Application card tab tests**:
  - Application Data
  - Banking / Flinks
  - Financial Data
  - Documents
  - Notes conversation
  - Credit Summary PDF generation
  - Lenders table + quotas + match %
- **Document preview & download**: Confirm inline preview and secure download behaviors.
- **Document accept/reject tests**: Validate moderation actions update statuses and timelines.
- **Communication Center tests**: Ensure messages across voice/SMS/email display and can be actioned.
- **CRM Contact tests (timeline, calls, SMS, email)**: Validate contact timelines and communication logs.
- **Marketing Tab tests**: Verify marketing campaign data and actions render correctly.
- **Lender Portal tests**: Confirm lender view permissions and data mapping.
- **Settings page tests**: Validate user/profile settings, notifications, and role-based controls.
