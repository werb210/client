# ✅ CLIENT APPLICATION INTEGRATION LOCKDOWN POLICY

**Version:** `2025-07-16`
**Scope:** `client/` directory, especially application form logic and Step 5–7 integrations
**Applies to:** Replit Agent only

---

## 🔒 LOCKED COMPONENTS

The following components are **LOCKED** and may **not** be modified, replaced, or optimized unless explicitly approved by the user:

### 1. 📄 **Multi-Step Application Form Logic**

* `src/routes/Step1_BusinessBasics.tsx` through `Step7_Submit.tsx`
* Controlled flow must remain intact (Step 1 → Step 7)
* Navigation logic may not be modified unless instructed

### 2. 📁 **Document Upload System**

* `Step5_DocumentUpload.tsx`, `DocumentUploadStatus.tsx`, `useDocumentVerification.ts`
* May not bypass, suppress, or skip document checks unless instructed
* `.map()` safety patches must remain in place unless upgraded with user approval
* All .map() and .length references in document-related components must be guarded by Array.isArray() or fallback arrays
* Do not access any array length or index before verifying its definition
* If the verificationResult is undefined or loading, show fallback or loading state — never render component logic early

#### 🚫 RESTRICTED ACTIONS:

| Component                   | Lock Rule                                                                                                              | Notes                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `DocumentUploadStatus.tsx`  | ❌ No changes to `documents`, `documentStatuses`, `additionalDocuments` access without explicit `Array.isArray()` check | Prevents `.map()` and `.length` runtime crashes                     |
| `SignNow SmartFields`       | ❌ Only template-compliant fields allowed: `legal_business_name`, `dba_name`, `contact_first_name`, `contact_email`, `requested_amount`, etc. | Smart field list must match template exactly                                |
| `Client Submission Payload` | ❌ No fallback fields unless explicitly approved                                                                        | All fallback values (e.g., `"unknown"`, `"N/A"`) must be documented |

#### ✅ ENFORCED RULES:

* All `.map()` and `.length` calls must use **safe variables** (e.g., `safeDocuments`, `safeAdditionalDocuments`).
* No smart field injection for fields not physically present in the SignNow template.
* Smart field names must match the template fields exactly: `legal_business_name`, `dba_name`, `contact_first_name`, `contact_last_name`, `contact_email`, `business_street_address`, `business_city`, `business_state`, `business_zip`, `requested_amount`, `use_of_funds`, etc.
* Conditional rendering must be used when `verificationResult` or documents data is undefined.
* Promise rejections from verification API must be handled via try/catch or query error states.

### 3. 📝 **SignNow Integration Trigger**

* Code initiating Step 6 signature flow must send:

  ```ts
  { templateId, redirectUrl }
  ```

  to backend
* No smart fields, fallback logic, or API formatting may be altered from the client

### 4. 🔐 **Authentication System (OTP, Session)**

* Login, password reset, OTP logic, and cookies must not be modified

### 5. 🧪 **Production Safety Features**

* Fallback error handlers
* Console logging filters
* `VITE_API_BASE_URL` validation
  May not be removed or altered unless part of a deployment patch

---

## 🚨 MODIFICATION PROTOCOL

To modify any of the locked components above, the Replit agent **must:**

1. Request **explicit approval** from the user.
2. Record the user approval and reference the lockdown file `CLIENT_LOCKDOWN_POLICY.md`
3. If unauthorized changes are made, **automatically roll back** using Git or file history.

---

## ✅ REQUIRED REPORTING RULES

Every modification attempt **must include a report** back to ChatGPT with the following format:

```
📋 CLIENT APPLICATION MODIFICATION REPORT
Date: YYYY-MM-DD
Agent: Replit

🔧 Component Updated:
(e.g., Step5_DocumentUpload.tsx)

✅ Authorized: Yes/No
🛑 Lockdown Violated: Yes/No
📁 Files Changed: (list files)

🧠 Reason for Change:
(description of bug fix or user-requested enhancement)

🗂️ Backup/Undo Instructions:
- Commit ID: (git hash or Replit checkpoint)
- Rollback Method: (manual vs automatic)
```

If unauthorized changes are attempted, the Replit agent must:

* Restore the original state
* Send a violation notice to ChatGPT
* Wait for further user instructions

---

## 📘 INTEGRATION STATUS

**Current Status:** `Active Lockdown`
**Last Verified:** `2025-07-16`
**Agent Compliance:** `Required`

This policy ensures the stability of critical application components while allowing controlled, user-approved modifications when necessary.