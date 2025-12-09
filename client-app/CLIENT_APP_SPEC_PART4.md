Here it is — PART 4: CLIENT APPLICATION (FULL SPEC, FINAL).

This is the Codex-ready, complete, enterprise-grade specification that governs:
•All 7 steps of the client application
•Dynamic questions system
•Dynamic required document system
•Offline mode
•Recommendation engine
•AI chatbot + Talk to Human + Issue reporting
•Loginless portal
•Status page rules
•Communication bridge to Staff-Server + Staff-Portal
•Security, caching, sync, mobile readiness
•Best practices for every component

Copy/paste the entire block into Codex exactly as-is.

⸻

🚀 Boreal Master Specification (V1)

PART 4 — CLIENT APPLICATION

The Client App is frontend-only, built with React/Vite, storing state locally, syncing with Staff-Server via authenticated API calls.

It must be:
•Fully offline-capable
•Mobile-first and desktop-polished
•Extremely stable
•Zero-login
•Perfectly consistent with your design system

⸻

1. Core Purpose

The Client App allows users to:
1.Complete a 7-step intelligent funding application
2.Get product recommendations
3.Upload documents
4.Electronically sign terms
5.Communicate with staff (chat + voice calling)
6.Return at any time and resume without logging in
7.See real-time application status

The app NEVER stores sensitive data remotely until final submission.

⸻

2. Tech Stack (Fixed)
•React + TypeScript
•Vite
•Zustand (local state store)
•React Query (server sync + caching)
•Tailwind + shadcn
•LocalForage (offline storage)
•OpenAI Assistant for AI Chatbot
•Chat + Voice calling via Staff-Server (Twilio proxy)
•File uploads via Staff-Server Blob upload endpoint
•Deep linking enabled (/apply/step-x)

⸻

3. 7-STEP APPLICATION FLOW (Exact)

These are the canonical 7 steps that Codex must implement.

⸻

STEP 1 — KYC + FINANCIAL PROFILE (STATIC)

Mandatory fields (fixed, always present):
1.Funding type
2.Amount requested
3.Country (CA/US only)
4.Province/State
5.Industry
6.Purpose of funds
7.Revenue last 12 months
8.Average monthly revenue
9.Sales history
10.AR balance
11.Fixed assets value

This step is static and used to:
•Drive recommendation engine
•Filter lender products
•Drive dynamic questions in steps 3 & 4
•Drive dynamic document requirements in Step 5

⸻

STEP 2 — PRODUCT CATEGORY SELECTION (DYNAMIC)

Uses Step 1 answers + lender products fetched from Staff-Server.

Client sees:
•Line of Credit
•Working Capital
•Factoring
•Equipment Financing
•Purchase Order
•Term Loan
•Startup Capital (V2)

Each tile shows:
•Match percentage
•Product count
•Category description
•“Selected” highlight

User can pick more than one.

Selections dictate:
•What dynamic business questions appear
•What dynamic applicant questions appear
•Required documents visible in Step 5

⸻

STEP 3 — BUSINESS DETAILS (SEMI-DYNAMIC)

Base fields (always present):
•DBA
•Legal Name
•Business Structure
•Address
•City
•State/Province
•Business Phone
•Website
•Business Start Date
•Employees
•Estimated Yearly Revenue

Dynamic Expansion (V2)

If lender has uploaded a PDF application with parseable fields, Staff-Server returns a structured schema:

{
  "business_questions": [
     { id, label, type, required, options? }
  ]
}

The Client App merges:

Default fields + Dynamic lender-required fields, removing duplicates.

All dynamic fields are labeled exactly as lender wrote them.

⸻

STEP 4 — APPLICANT DETAILS (SEMI-DYNAMIC)

Base fields:
•First Name
•Last Name
•Email
•Phone
•Street address
•City
•State/Province
•ZIP/Postal
•Date of Birth
•SSN/SIN
•Ownership %

Business Partner Section (ALWAYS EXISTS)

If user checks “This business has multiple owners”:
Client app displays partner block with:
•First/Last Name
•Email
•Phone
•Address
•City
•State
•ZIP
•DOB
•SSN
•Ownership %

Dynamic Expansion (V2)

Same as Step 3, dynamic applicant questions come from lender application schemas.

⸻

STEP 5 — REQUIRED DOCUMENTS (FULLY DYNAMIC)

This is where the dynamic system becomes critical.

How document requirements are built:
1.User selects product categories in Step 2
2.Staff-Server returns all lender products in those categories
3.The client app intersects + unifies all required docs

Example:
•Lender A: docs 1,2,5
•Lender B: docs 1,3,4
•Lender C: docs 1,2

Client must show required uploads:
1,2,3,4,5

Mandatory default rule (until Flinks integrated):

“6 months of banking statements”
Must always appear regardless of category or lender.

Document uploader requirements:
•One uploader per category
•Supports: PDF, PNG, JPG, DOCX, XLSX
•Local preview
•Delete before submission
•Automatic compression
•Virus scan triggered server-side
•Upload resume if user refreshes
•Offline uploads queued and retried

⸻

STEP 6 — TERMS, CONSENT & SIGNATURE

Contains:
•Terms and conditions (static)
•Consent to pull credit (static)
•Checkbox: “I agree”
•Typed signature
•Timestamp auto-assigned

When user clicks submit:
1.Full application payload is built
2.Documents packaged with metadata
3.Single POST call to Staff-Server
4.On success → route to Step 7

⸻

STEP 7 — SUBMISSION SUCCESS + STATUS PAGE

After submission, user sees:
•Thank-you message
•Application reference number
•Button: “View Status / Upload more documents / Chat with us”

Status page features:
•Shows current pipeline stage
•Shows required-docs still missing
•Shows document acceptance/rejection
•Shows ability to re-upload rejected docs
•Fully synchronized with Staff-Portal
•Chat and call buttons visible on all status pages

If a staff user rejects a doc →
Status page shows a red banner with category name and required action.

Everything logs to CRM timeline.

⸻

4. AI CHATBOT + TALK TO A HUMAN + ISSUE REPORTING

4.1 AI Chatbot
•Powered by OpenAI Assistant
•Embedded from the bottom-right FAB
•Knows all FAQ answers
•Knows all troubleshooting flows
•Trained on your lender products + rules
•Can check application status (read-only)
•All conversations logged to CRM timeline

4.2 Talk to a Human
•Shared chat channel identical to Staff-Portal internal chat
•Real-time WebSocket
•Staff sees messages inside CRM record
•Client sees them inside portal chat

4.3 Voice Call Button
•Click → initiates Twilio voice call via Staff-Server
•Staff receives call via Twilio softphone
•CDR logged in CRM

4.4 Report an Issue

Simple form:
•Email
•Phone
•Description
•Optional screenshot

Ticket appears in Staff-Portal under “Issues”.

⸻

5. OFFLINE MODE & DATA CONSISTENCY

Client app must:
•Cache all lender products
•Cache all dynamic questions
•Cache all required docs
•Persist incomplete applications locally
•Resume safely after browser close or offline period

Local Storage Rules

Use LocalForage:

application_data
uploaded_documents
lender_products_cache
dynamic_questions_cache
required_docs_cache

If offline:
•User can continue filling out everything
•Document uploads are queued
•Submission is blocked until online

On reconnect:
•Sync queued uploads
•Sync updated lender product rules
•Sync chat messages

Best-practice rules:
•Must implement conflict resolution
•Must avoid corrupt states
•Must prevent duplicate submissions

⸻

6. COMMUNICATION WITH STAFF-SERVER

6.1 Pull data

Client app pulls from:
•/api/public/lenders/products
•/api/public/lenders/categories
•/api/application/status/:id
•/api/application/documents/:id
•/api/chat/:applicationId

6.2 Push data

Client app sends:
•Full application submission
•Document uploads
•Chat messages
•Voice-call initiation request
•Issue reports

6.3 Security
•Token-based short-lived auth token assigned on first visit
•No user login
•Tokens renewed periodically
•Cannot access staff-only APIs

⸻

7. DESIGN REQUIREMENTS

Must match the screenshots you provided:
•BF colours
•BF font tokens
•Horizontal navbar
•Clean card layout
•Mobile responsive
•Consistent icons

Every component must be Figma-ready.

⸻

8. TESTING REQUIREMENTS

Codex must generate:

Unit tests:
•All 7 steps
•Document uploader
•Offline storage manager
•Recommendation engine

Integration tests:
•Dynamic questions
•Dynamic required-doc merging
•Product category ranking
•Submission pipeline

End-to-end tests:
•Full 7-step flow
•Offline → online resume
•Reject → re-upload document
•Chat & voice call flows

⸻

END OF PART 4 — CLIENT APPLICATION SPEC
