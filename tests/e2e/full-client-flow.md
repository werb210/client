# Full Client Flow E2E Tests (Client App)

## Scope
Client-facing end-to-end scenarios ensuring interoperability without changing logic.

## Test Cases
- **Step 1 KYC full cycle**: Validate identity capture, verification, and retry handling.
- **Step 2 recommendation engine behavior**: Confirm recommendation results adapt to inputs and eligibility rules.
- **Step 3 dynamic business questions**: Ensure business questions render conditionally and save responses.
- **Step 4 dynamic applicant questions**: Validate applicant-specific questions with branching logic and persistence.
- **Step 5 required docs logic**: Confirm required document list generation and blocking behavior for missing docs.
- **Offline upload behavior**: Test deferred uploads, sync, and user feedback when reconnecting.
- **AI chatbot tests**: Validate chatbot guidance, intent recognition, and guardrails.
- **Talk-to-human path tests**: Ensure escalation to human support with context transfer.
- **Report-issue path tests**: Confirm issue submission, tracking, and user notifications.
- **Submit → SignNow redirect flow**: Validate submission triggers SignNow package and redirects with correct parameters.
- **Reset application test**: Ensure resetting clears local data while preserving server state constraints.
- **Token corruption recovery**: Simulate token errors and validate recovery flows without data loss.
- **Double submission prevention**: Confirm UI/UX prevents duplicate submissions and server rejects duplicates gracefully.
