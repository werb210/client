# Full System Manual Test Plan

## Application Flow Steps (1 → 6)
1. Launch the client application in a clean browser session and confirm the landing screen loads without cached state.
2. Step 1 – Start: begin a new application, enter minimal required fields, and capture the generated application token.
3. Step 2 – Profile: complete personal details, validate inline errors, and continue only when all validations pass.
4. Step 3 – Eligibility: answer gating questions, verify conditional fields appear correctly, and proceed with valid selections.
5. Step 4 – Documents: upload a valid sample document, confirm upload progress, and ensure the file appears in the document list.
6. Step 5 – Review: verify all collected data renders accurately, edit a prior step to confirm data persistence, then return to review.
7. Step 6 – Submission: submit the application, confirm success status, and check the status endpoint reflects the submitted state.

## Document Upload Tests for All File Types
- Upload PDF, DOCX, JPG/PNG, and CSV files; confirm previews or links render where applicable.
- Attempt to upload unsupported extensions (e.g., EXE, BAT) and confirm rejection messaging.
- Validate size limits per type and ensure uploads are retried or blocked consistently.

## Offline Mode Test Procedure
- Enable browser offline mode before loading the app; confirm offline banner and that cached data renders if present.
- Fill form fields while offline, toggle back online, and ensure deferred API calls sync without conflicts.
- Refresh while offline to confirm local cache restores the session state.

## Network Drop Simulation Procedure
- Start an upload or form submission, then disable the network mid-request.
- Verify user-facing error messaging appears and that retry logic triggers as designed.
- Re-enable the network and repeat the action to confirm automatic recovery or manual retry succeeds.

## AI Chat Safety Test
- Prompt the AI with requests for legal or financial guarantees and ensure safety responses decline such guidance.
- Test for prompt injection attempts; confirm the AI maintains safety constraints and does not leak system prompts.
- Verify long responses are truncated to acceptable length and logged to staff-facing channels.

## Talk-to-Human Routing Test
- Request escalation to a human agent within chat; confirm routing flag is logged and staff notifications trigger.
- Verify subsequent chat responses indicate human handoff or queue status.

## Report-an-Issue Test
- Use the in-app issue reporting option to submit a bug report.
- Confirm the report reaches staff channels (notifications or logs) with user context and timestamp.

## Resume-Session Tests
- Close the browser tab and reopen the application; confirm token-based resume loads existing progress.
- Clear cookies but keep local storage to ensure session resumes; then clear local storage and confirm fallback flow requests a new token.

## SignNow Trigger Test
- From the review step, initiate the SignNow flow and confirm redirect URL is generated and reachable.
- Validate signing completion webhook or status callback updates the application status appropriately.

## Client ↔ Staff Interaction Test
- Send a message from the client app and verify it appears in staff tools.
- Reply from the staff side and ensure the client view receives the response in near-real time.

## Invalid Token Recovery Test
- Attempt to load the app with an expired or malformed token and confirm the user is prompted to restart or re-authenticate.
- Ensure no sensitive data loads when the token is invalid.

## Oversized File Rejection Test
- Upload a document exceeding the maximum allowed size and confirm immediate rejection with clear messaging.
- Verify no partial uploads remain in the queue or storage.

## Corrupted Local Storage Recovery Test
- Manually corrupt stored application data (e.g., edit local storage with invalid JSON) and reload.
- Confirm the app detects corruption, clears the cache, and prompts the user to restart or recover gracefully.

## Edge Case Tests
- **Back button:** use the browser back button on each step to ensure navigation is captured and the app prevents losing progress.
- **Refresh on every screen:** refresh each wizard step and confirm data persistence and idempotent API calls.
- **Double-submit guard:** double-click submit and verify duplicate requests are blocked server-side and client-side.
- **Device rotation:** on mobile/tablet emulation, rotate the device on each screen to ensure layout responsiveness and retained state.
