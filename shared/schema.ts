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
  // Stage 1 - Financial Profile
  businessLocation: z.enum(['US', 'CA']),
  headquartersState: z.string().optional(),
  industry: z.string(),
  lookingFor: z.enum(['capital', 'equipment', 'both']),
  fundingAmount: z.number().positive(),
  useOfFunds: z.string(),
  fundsPurpose: z.string(),
  salesHistory: z.enum(['<1yr', '1-2yr', '2+yr']),
  businessAge: z.string().optional(),
  revenueLastYear: z.number().nonnegative(),
  lastYearRevenue: z.number().nonnegative(),
  averageMonthlyRevenue: z.number().nonnegative(),
  monthlyRevenue: z.number().nonnegative(),
  accountsReceivableBalance: z.number().nonnegative(),
  accountsReceivable: z.number().nonnegative(),
  fixedAssetsValue: z.number().nonnegative(),
  fixedAssets: z.number().nonnegative(),
  equipmentValue: z.number().nonnegative().optional(),

  // Stage 3 – Business Details
  businessName: z.string(),
  operatingName: z.string(),
  legalName: z.string(),
  businessAddress: z.string(),
  businessStreetAddress: z.string(),
  businessCity: z.string(),
  businessState: z.string(),
  businessPostalCode: postalValidation,
  businessZipCode: z.string().optional(),
  businessCountry: z.string().optional(),
  businessPhone: phoneValidation,
  businessEmail: z.string().email().optional(),
  businessWebsite: z.string().url().optional(),
  businessStartDate: z.coerce.date(),
  incorporationDate: z.coerce.date().optional(),
  businessStructure: z.enum(['sole_proprietorship', 'partnership', 'llc', 'corporation', 's_corp', 'non_profit']),
  businessTaxId: z.string().optional(),
  taxId: z.string().optional(),
  businessDescription: z.string().optional(),
  employeeCount: z.number().int().positive(),
  numberOfEmployees: z.string().optional(),
  estimatedYearlyRevenue: z.number().optional(),
  annualRevenue: z.string().optional(),
  monthlyExpenses: z.string().optional(),
  totalAssets: z.string().optional(),
  totalLiabilities: z.string().optional(),

  // Stage 4 – Applicant Info
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  applicantName: z.string().optional(),
  title: z.string().optional(),
  titleInBusiness: z.string().optional(),
  email: z.string().email().optional(),
  applicantEmail: z.string().email().optional(),
  personalEmail: z.string().email().optional(),
  personalPhone: phoneValidation.optional(),
  mobilePhone: phoneValidation.optional(),
  dateOfBirth: z.coerce.date().optional(),
  applicantBirthdate: z.coerce.date().optional(),
  sin: z.string().optional(),
  socialSecurityNumber: z.string().optional(),
  applicantSSN: z.string().optional(),
  ownershipPercentage: z.number().optional(),
  percentageOwnership: z.number().optional(),
  creditScore: z.string().optional(),
  personalAnnualIncome: z.string().optional(),
  homeAddress: z.string().optional(),
  applicantStreetAddress: z.string().optional(),
  city: z.string().optional(),
  homeCity: z.string().optional(),
  applicantCity: z.string().optional(),
  province: z.string().optional(),
  homeState: z.string().optional(),
  applicantState: z.string().optional(),
  postalCode: postalValidation.optional(),
  homePostalCode: postalValidation.optional(),
  applicantPostalCode: postalValidation.optional(),

  // Partner (optional)
  partnerFirstName: z.string().optional(),
  partnerLastName: z.string().optional(),
  partnerName: z.string().optional(),
  partnerEmail: z.string().email().optional(),
  partnerPersonalPhone: phoneValidation.optional(),
  partnerPhone: phoneValidation.optional(),
  partnerOwnership: z.number().optional(),
  partnerOwnershipPercentage: z.number().optional(),
  partnerTitle: z.string().optional(),
  partnerSin: z.string().optional(),
  partnerSSN: z.string().optional(),

  // Stage 6 – Consents
  communicationConsent: z.boolean().refine((v) => v, {
    message: 'You must consent to communication',
  }),
  documentMaintenanceConsent: z.boolean().refine((v) => v, {
    message: 'You must consent to document maintenance',
  }),

  // Stage 5 - Document Upload
  uploadedDocuments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    type: z.string(),
    documentType: z.string(),
    status: z.enum(['uploading', 'completed', 'error']),
    url: z.string().optional(),
  })).optional(),

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
  businessLocation: true,
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