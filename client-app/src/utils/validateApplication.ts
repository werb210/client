import { z } from "zod";
import { RequiredDoc } from "@/utils/resolveRequiredDocs";
import { ClientDocumentMeta } from "@/utils/documentMetadata";

/* ===========================
   STEP 1 — KYC VALIDATION
   (very lightweight)
=========================== */

export const KYCSchema = z.object({
  businessType: z.string().min(2),
  yearsInBusiness: z.string().min(1),
  annualRevenue: z.string().min(1),
  monthlySales: z.string().min(1),
  industry: z.string().min(1),
});

/* ===========================
   STEP 3 — BUSINESS INFO
=========================== */

export const BusinessInfoSchema = z.object({
  businessName: z.string().min(2),
  operatingName: z.string().optional(),
  businessAddress: z.string().min(3),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().min(3),
  yearsInBusiness: z.string().min(1),
  revenue: z.string().min(1),
  acceptsCards: z.string().min(1),
  hasBusinessPartner: z.boolean(),
});

/* ===========================
   STEP 4 — APPLICANT INFO
=========================== */

export const ApplicantInfoSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  homeAddress: z.string().min(3),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().min(3),
  sin: z.string().min(3),
  dateOfBirth: z.string().min(3),
  creditScoreBand: z.string().min(1),
  partnerFirstName: z.string().optional(),
  partnerLastName: z.string().optional(),
  partnerEmail: z.string().optional(),
  partnerPhone: z.string().optional(),
});

/* ===========================
   STEP 5 — DOCUMENTS
=========================== */

function validateDocuments(
  requiredDocs: RequiredDoc[],
  uploadedDocs: ClientDocumentMeta[]
) {
  const missing: string[] = [];

  for (const req of requiredDocs) {
    const exists = uploadedDocs.some((doc) => doc.category === req.category);
    if (!exists) missing.push(req.label);
  }

  return {
    ok: missing.length === 0,
    missing,
  };
}

/* ===========================
   FULL APPLICATION VALIDATION
=========================== */

export interface FullApplicationPayload {
  step1: any;
  step3: any;
  step4: any;
  selectedProduct: any;
  documents: ClientDocumentMeta[];
  requiredDocs: RequiredDoc[];
}

export function validateFullApplication(payload: FullApplicationPayload) {
  const errors: string[] = [];

  // Step 1
  const kyResult = KYCSchema.safeParse(payload.step1);
  if (!kyResult.success) errors.push("Step 1 is incomplete.");

  // Step 3
  const bizResult = BusinessInfoSchema.safeParse(payload.step3);
  if (!bizResult.success) errors.push("Business Information is incomplete.");

  // Step 4
  const appResult = ApplicantInfoSchema.safeParse(payload.step4);
  if (!appResult.success) errors.push("Applicant Information is incomplete.");

  // Step 5 documents
  const docCheck = validateDocuments(payload.requiredDocs, payload.documents);
  if (!docCheck.ok) {
    errors.push("Missing Required Documents: " + docCheck.missing.join(", "));
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
