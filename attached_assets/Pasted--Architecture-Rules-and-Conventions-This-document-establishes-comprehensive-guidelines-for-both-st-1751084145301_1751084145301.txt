# Architecture Rules and Conventions

This document establishes comprehensive guidelines for both staff and client applications to ensure security, scalability, and architectural alignment.

## ✅ Rules for Both Apps (Staff + Client)

### 🔐 Security & Authentication

1. **All API access must be authenticated** using JWT (staff) or session-based OAuth (client).
2. **All routes must be role-guarded** (staff, client, admin, lender, referrer) and respect tenant isolation.
3. **Never bypass tenant checks** in DB queries or APIs.
4. **Do not store sensitive tokens or personal data in localStorage** — use secure cookies or encrypted IndexedDB if needed.
5. **Client must not attempt to directly read/write from the shared database.**

---

## 🧱 Shared Architecture Rules

1. ✅ **The "staff" application owns the shared database and all business logic.**

   * Only the staff backend writes to or reads from the database.
   * All validation, signing, document storage, OCR, and communication is handled here.

2. ✅ **The "client" application is frontend-only.**

   * It should never contain a backend, database, or business rules.
   * It must submit or request data strictly via the staff API.

3. ✅ **API communication must be centralized.**

   * Every app must use a `lib/api.ts` or `services/apiClient.ts` to encapsulate all fetch or Axios logic.
   * No direct `fetch(...)` scattered in components.

4. ✅ **Offline support only in client, not staff.**

   * Use IndexedDB in the client to queue form data and documents when offline.
   * Automatically sync when reconnected.

5. ✅ **Document upload = actual file storage**

   * No placeholders.
   * Store uploaded files as actual binary (or path to disk/S3) in the staff backend.
   * Client and staff portals must both allow viewing, downloading, and forwarding the actual file.

6. ✅ **SignNow Integration = Redirect flow, not iframe**

   * Staff backend manages invite creation and webhook handling.
   * Client app redirects to `sign_url`, and backend receives webhook upon completion.

---

## 🧪 Testing & Stability Rules

1. ✅ All document uploads must be tested with real PDFs, not dummy files.
2. ✅ Final submission flow must trigger complete storage of:

   * Application data
   * Signed status
   * Actual documents
   * Audit log
3. ✅ Replit AI must report after every major change and **not proceed without approval**.

---

## Optional Rules (Recommended for Production)

* Enable **Rate limiting + IP logging** on API endpoints
* Log **all user actions** in staff portal (audit trail)
* Use **file checksum verification** (e.g., SHA256) for documents submitted
* Consider a **versioning system** for application data

---

## Implementation Guidelines

These rules are now part of the default build standard and should be respected in all future development. Never override or ignore these rules without explicit approval.

### Key Principles

1. **Security First**: All data access must be authenticated and tenant-isolated
2. **Centralized Business Logic**: Staff backend owns all database operations and business rules
3. **API-Driven Architecture**: Client applications communicate only through well-defined APIs
4. **Real Data**: No mock, placeholder, or synthetic data in production systems
5. **Comprehensive Testing**: All features must be tested with actual data and files

### Development Workflow

1. All changes must be reported and approved before proceeding
2. Architecture modifications require documentation updates
3. Security rules cannot be bypassed or modified without explicit approval
4. Testing must include real file uploads and complete data flows

---

*This document serves as the authoritative guide for all development work on this platform. Any deviations from these rules must be explicitly approved and documented.*