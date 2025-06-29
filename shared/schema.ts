//  =========================
//  CLIENT – FORM TYPES & SCHEMA
//  =========================
import { z } from 'zod';

/* ------------------------------------------------------------------
   REGION HELPERS (US vs CA masks)
-------------------------------------------------------------------*/
const phoneValidation = z
  .string()
  .min(10, 'Phone must have 10 digits')
  .transform((val) => val.replace(/\D/g, ''));

const postalValidation = z.string().refine((v) => /[0-9A-Za-z]{3,10}/.test(v), {
  message: 'Invalid postal/ZIP code',
});

/* ------------------------------------------------------------------
   MASTER FORM SCHEMA (42 FIELDS)
-------------------------------------------------------------------*/
export const ApplicationFormSchema = z.object({
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

  // Stage 3 – Business Details
  operatingName: z.string(),
  legalName: z.string(),
  businessStreetAddress: z.string(),
  businessCity: z.string(),
  businessState: z.string(),
  businessPostalCode: postalValidation,
  businessCountry: z.string().optional(),
  businessPhone: phoneValidation,
  employeeCount: z.number().int().positive(),
  businessWebsite: z.string().url().optional(),
  businessStartDate: z.coerce.date(),
  businessStructure: z.string(),
  estimatedYearlyRevenue: z.number().optional(),

  // Stage 4 – Applicant
  applicantName: z.string().optional(),
  applicantEmail: z.string().email().optional(),
  applicantBirthdate: z.coerce.date().optional(),
  applicantSSN: z.string().optional(),
  percentageOwnership: z.number().optional(),
  mobilePhone: phoneValidation.optional(),
  applicantStreetAddress: z.string().optional(),
  applicantCity: z.string().optional(),
  applicantState: z.string().optional(),
  applicantPostalCode: postalValidation.optional(),
  titleInBusiness: z.string().optional(),

  // Partner (optional)
  partnerName: z.string().optional(),
  partnerEmail: z.string().email().optional(),
  partnerPhone: phoneValidation.optional(),
  partnerOwnership: z.number().optional(),
  partnerTitle: z.string().optional(),
  partnerSSN: z.string().optional(),

  // Stage 6 – Consents
  communicationConsent: z.boolean().refine((v) => v, {
    message: 'You must consent to communication',
  }),
  documentMaintenanceConsent: z.boolean().refine((v) => v, {
    message: 'You must consent to document maintenance',
  }),

  // Hidden/signature fields (populated server-side)
  signNowSignatureCompleted: z.boolean().optional(),
  signatureData: z.any().optional(),
  submissionConfirmed: z.boolean().optional(),
});

export type ApplicationForm = z.infer<typeof ApplicationFormSchema>;

/* ------------------------------------------------------------------
   STEP SCHEMAS (for React‑Hook‑Form per page validation)
-------------------------------------------------------------------*/
export const Step1Schema = ApplicationFormSchema.pick({
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

export const Step3Schema = ApplicationFormSchema.pick({
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

export const Step4Schema = ApplicationFormSchema.pick({
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

export const Step6Schema = ApplicationFormSchema.pick({
  communicationConsent: true,
  documentMaintenanceConsent: true,
});

// Export validation helpers
export const phoneSchema = phoneValidation;
export const postalSchema = postalValidation;