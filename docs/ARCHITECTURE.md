# Financial Application Portal - Architecture Rules

## Overview

This document defines the mandatory architectural conventions for both the **staff** and **client** applications in the financial portal system.

## Security & Authentication Rules

1. **All API access must be authenticated** using JWT (staff) or session-based OAuth (client)
2. **All routes must be role-guarded** (staff, client, admin, lender, referrer) and respect tenant isolation
3. **Never bypass tenant checks** in DB queries or APIs
4. **Do not store sensitive tokens or personal data in localStorage** — use secure cookies or encrypted IndexedDB if needed
5. **Client must not attempt to directly read/write from the shared database**

## Shared Architecture Rules

### 1. Staff Application Ownership
✅ **The "staff" application owns the shared database and all business logic**
- Only the staff backend writes to or reads from the database
- All validation, signing, document storage, OCR, and communication is handled here

### 2. Client Application Constraints
✅ **The "client" application is frontend-only**
- It should never contain a backend, database, or business rules
- It must submit or request data strictly via the staff API

### 3. API Communication Standards
✅ **API communication must be centralized**
- Every app must use a `lib/api.ts` or `services/apiClient.ts` to encapsulate all fetch or Axios logic
- No direct `fetch(...)` scattered in components

### 4. Offline Support
✅ **Offline support only in client, not staff**
- Use IndexedDB in the client to queue form data and documents when offline
- Automatically sync when reconnected

### 5. Document Storage
✅ **Document upload = actual file storage**
- No placeholders
- Store uploaded files as actual binary (or path to disk/S3) in the staff backend
- Client and staff portals must both allow viewing, downloading, and forwarding the actual file

### 6. E-Signature Integration
✅ **SignNow Integration = Redirect flow, not iframe**
- Staff backend manages invite creation and webhook handling
- Client app redirects to `sign_url`, and backend receives webhook upon completion

## Testing & Stability Rules

1. ✅ All document uploads must be tested with real PDFs, not dummy files
2. ✅ Final submission flow must trigger complete storage of:
   - Application data
   - Signed status
   - Actual documents
   - Audit log
3. ✅ Replit AI must report after every major change and **not proceed without approval**

## Production Recommendations

- Enable **Rate limiting + IP logging** on API endpoints
- Log **all user actions** in staff portal (audit trail)
- Use **file checksum verification** (e.g., SHA256) for documents submitted
- Consider a **versioning system** for application data

## Compliance

**These rules are now part of the default build standard and should be respected in all future development. Never override or ignore these rules without explicit approval.**

---

*Last Updated: June 28, 2025*