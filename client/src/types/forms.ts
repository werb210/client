//  =========================
//  CLIENT – FORM TYPES & SCHEMA
//  =========================
import { z } from 'zod';

/* ------------------------------------------------------------------
   REGION HELPERS (US vs CA masks)
-------------------------------------------------------------------*/
export const phoneSchema = z
  .string()
  .min(10, 'Phone must have 10 digits')
  .transform((val) => val.replace(/\D/g, ''));

export const postalSchema = z.string().refine((v) => /[0-9A-Za-z]{3,10}/.test(v), {
  message: 'Invalid postal/ZIP code',
});

/* ------------------------------------------------------------------
   MASTER FORM SCHEMA (42 FIELDS)
-------------------------------------------------------------------*/
export const ApplicationSchema = z.object({
  // Stage 1
  headquarters: z.enum(['US', 'CA']),
  headquartersState: z.string().optional(),
  industry: z.string(),
  lookingFor: z.enum(['capital', 'equipment', 'both']),
  fundingAmount: z.number().positive(),
  fundsPurpose: z.string(),
  salesHistory: z.enum(['<1yr', '1-2yr', '2+yr']),
  revenueLastYear: z.number().nonnegative(),
  averageMonthlyRevenue: z.number().nonnegative(),
  accountsReceivableBalance: z.number().nonnegative(),
  fixedAssetsValue: z.number().nonnegative(),

  // Stage 2 - Product Selection
  selectedProductId: z.string().optional(),
  selectedProductName: z.string().optional(),
  selectedLenderName: z.string().optional(),
  matchScore: z.number().optional(),

  // Stage 3 – Business Details
  businessOperatingName: z.string().optional(),
  businessLegalName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessCity: z.string().optional(),
  businessStateProvince: z.string().optional(),
  businessPostalCode: z.string().optional(),
  businessPhone: z.string().optional(),
  employeeCount: z.string().optional(),
  businessStartDate: z.string().optional(),
  businessStructure: z.string().optional(),
  estimatedRevenue: z.string().optional(),
  businessWebsite: z.string().optional(),
  businessCountry: z.string().optional(),

  // Stage 4 – Applicant Information
  applicantName: z.string().optional(),
  applicantEmail: z.string().optional(),
  titleInBusiness: z.string().optional(),
  percentageOwnership: z.string().optional(),
  mobilePhone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  sinSsn: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  postalCode: z.string().optional(),

  // Partner Information (conditional)
  partnerName: z.string().optional(),
  partnerEmail: z.string().optional(),
  partnerPhone: z.string().optional(),
  partnerOwnership: z.string().optional(),
  partnerTitle: z.string().optional(),
  partnerSinSsn: z.string().optional(),

  // Stage 5 – Document Upload
  uploadedDocuments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    type: z.string(),
    documentType: z.string(),
    status: z.string(),
  })).optional(),
  documentsSkipped: z.boolean().optional(),

  // Stage 6 – Consents
  communicationConsent: z.boolean().refine((v) => v, {
    message: 'You must consent to communication',
  }),
  documentMaintenanceConsent: z.boolean().refine((v) => v, {
    message: 'You must consent to document maintenance',
  }),

  // Product selection fields (Step 2) - removing duplicates
  // selectedProductId: already defined above
  // selectedProductName: already defined above  
  // selectedLenderName: already defined above
  // matchScore: already defined above

  // Hidden/signature fields (populated server-side)
  signNowSignatureCompleted: z.boolean().optional(),
  signatureData: z.any().optional(),
  submissionConfirmed: z.boolean().optional(),
});

export type ApplicationForm = z.infer<typeof ApplicationSchema>;

/* ------------------------------------------------------------------
   STEP SCHEMAS (for React‑Hook‑Form per page validation)
-------------------------------------------------------------------*/
// TESTING MODE: All step schemas made optional for easier testing
export const step1Schema = z.object({
  headquarters: z.string().optional(),
  headquartersState: z.string().optional(),
  industry: z.string().optional(),
  lookingFor: z.enum(["capital", "equipment", "both"]).optional(),
  fundingAmount: z.number().optional(),
  fundsPurpose: z.string().optional(),
  salesHistory: z.string().optional(),
  revenueLastYear: z.string().optional(),
  averageMonthlyRevenue: z.string().optional(),
  accountsReceivableBalance: z.number().optional(),
  fixedAssetsValue: z.number().optional(),
});

export const step3Schema = z.object({
  operatingName: z.string().optional(),
  legalName: z.string().optional(),
  businessStreetAddress: z.string().optional(),
  businessCity: z.string().optional(),
  businessState: z.string().optional(),
  businessPostalCode: z.string().optional(),
  businessPhone: z.string().optional(),
  employeeCount: z.number().optional(),
  businessWebsite: z.string().optional(),
  businessStartDate: z.string().optional(),
  businessStructure: z.string().optional(),
  estimatedYearlyRevenue: z.number().optional(),
});

export const step4Schema = z.object({
  applicantName: z.string().optional(),
  applicantEmail: z.string().optional(),
  applicantBirthdate: z.string().optional(),
  applicantSSN: z.string().optional(),
  percentageOwnership: z.number().optional(),
  mobilePhone: z.string().optional(),
  applicantStreetAddress: z.string().optional(),
  applicantCity: z.string().optional(),
  applicantState: z.string().optional(),
  applicantPostalCode: z.string().optional(),
  titleInBusiness: z.string().optional(),
  partnerName: z.string().optional(),
  partnerEmail: z.string().optional(),
  partnerPhone: z.string().optional(),
  partnerOwnership: z.number().optional(),
  partnerTitle: z.string().optional(),
  partnerSSN: z.string().optional(),
});

export const step2Schema = z.object({
  selectedProductId: z.string().optional(),
  selectedProductType: z.string().optional(),
  matchScore: z.number().optional(),
});

export const step6Schema = z.object({
  communicationConsent: z.boolean().optional(),
  documentMaintenanceConsent: z.boolean().optional(),
});