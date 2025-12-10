# Full System Flow Integration Tests (Staff-Server)

## Scope
End-to-end system validation for staff-server services without altering existing logic.

## Test Cases
- **API health checks**: Verify health endpoints respond with 200 and expected payload across all services.
- **Application creation test**: Submit new application payload; confirm record creation and returned IDs.
- **Document upload → storage → DB record validation**: Upload documents via API, ensure storage persistence and database metadata alignment.
- **OCR trigger validation**: Confirm OCR job enqueued and status updates upon document ingestion.
- **Banking analysis trigger validation**: Validate banking analysis job initiation post-upload and resulting data artifacts.
- **Sales pipeline automation test**: Ensure automation rules fire to place application in correct pipeline stage.
- **Lender product retrieval test**: Request lender products, assert filtering, quotas, and match calculations.
- **Send-to-lender test including payload format**: Submit lender handoff, validate payload schema, transport success, and acknowledgements.
- **SignNow initiation test**: Trigger SignNow package creation, verify redirect URL and package metadata.
- **SignNow callback test**: Simulate callback, validate signature status updates and audit logs.
- **Document re-mounting test**: Confirm documents can be re-mounted to applications after callbacks or revisions.
- **CRM timeline entry creation for all events**: Verify timeline entries for uploads, OCR, banking analysis, lender sends, and signatures.
- **AI chatbot message routing tests**: Ensure AI chatbot routes inquiries to correct intents and produces responses.
- **Talk-to-human routing tests**: Validate escalation from chatbot to human queues with context preservation.
- **Report-an-issue routing tests**: Confirm issue reports create tickets/tasks and notify appropriate channels.
