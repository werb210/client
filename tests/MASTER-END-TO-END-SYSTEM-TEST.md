# Master End-to-End System Test Suite

## Scope
Cross-system validation covering client app, staff server, and staff portal interoperability without modifying existing logic.

## Test Domains
1. **Client App → Staff-Server interoperability**: Ensure client submissions create server records, trigger workflows, and surface errors gracefully.
2. **Client App → Staff-Portal visibility**: Validate data created in the client reflects accurately and promptly in the staff portal.
3. **Document lifecycle from client → storage → staff portal**: Track upload, storage persistence, metadata, and portal visibility.
4. **OCR lifecycle**: Confirm OCR initiation, processing, status updates, and output consumption across systems.
5. **Banking analysis lifecycle**: Validate banking data ingestion, analysis triggers, and downstream availability.
6. **AI insights → credit summary behavior**: Ensure AI outputs feed credit summaries and render correctly in portal reports.
7. **Lender matching**: Verify lender matching logic, quotas, match percentages, and eligibility filters across silos.
8. **Send-to-lender routing**: Test payload composition, transport, acknowledgements, and audit logging for lender sends.
9. **Status propagation back to client**: Confirm status changes in staff systems reflect in the client app promptly.
10. **Voice/SMS/Email routing via Communication Center**: Validate omnichannel routing, logging, and user visibility.
11. **CRM timeline verification**: Ensure all events (uploads, OCR, banking analysis, lender sends, signatures) appear in timelines.
12. **Multi-silo segregation (BF / BI / SLF)**: Confirm data and permissions respect silo boundaries across applications.
13. **Authentication + role checks**: Validate auth flows and role-based access for all systems.
14. **Data consistency checks across all systems**: Reconcile data points between client, server, and portal to detect drift.
