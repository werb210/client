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
export const step1Schema = ApplicationSchema.pick({
  headquarters: true,
  headquartersState: true,
  industry: true,
  lookingFor: true,
  fundingAmount: true,
  fundsPurpose: true,
  salesHistory: true,
  revenueLastYear: true,
  averageMonthlyRevenue: true,
  accountsReceivableBalance: true,
  fixedAssetsValue: true,
});

export const step3Schema = ApplicationSchema.pick({
  operatingName: true,
  legalName: true,
  businessStreetAddress: true,
  businessCity: true,
  businessState: true,
  businessPostalCode: true,
  businessPhone: true,
  employeeCount: true,
  businessWebsite: true,
  businessStartDate: true,
  businessStructure: true,
  estimatedYearlyRevenue: true,
});

export const step4Schema = ApplicationSchema.pick({
  applicantName: true,
  applicantEmail: true,
  applicantBirthdate: true,
  applicantSSN: true,
  percentageOwnership: true,
  mobilePhone: true,
  applicantStreetAddress: true,
  applicantCity: true,
  applicantState: true,
  applicantPostalCode: true,
  titleInBusiness: true,
  partnerName: true,
  partnerEmail: true,
  partnerPhone: true,
  partnerOwnership: true,
  partnerTitle: true,
  partnerSSN: true,
});

export const step2Schema = ApplicationSchema.pick({
  selectedProductId: true,
  selectedProductType: true,
  matchScore: true,
});

export const step6Schema = ApplicationSchema.pick({
  communicationConsent: true,
  documentMaintenanceConsent: true,
});