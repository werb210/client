//  =========================
//  UNIFIED CLIENT & STAFF SCHEMA - SINGLE SOURCE OF TRUTH
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
   UNIFIED APPLICATION SCHEMA (ALL FIELD NAMES STANDARDIZED)
-------------------------------------------------------------------*/
export const ApplicationFormSchema = z.object({
  // Stage 1 - Financial Profile 
  businessLocation: z.enum(['US', 'CA']),
  headquarters: z.enum(['US', 'CA']),
  headquartersState: z.string().optional(),
  industry: z.string(),
  lookingFor: z.enum(['capital', 'equipment', 'both']),
  fundingAmount: z.number().positive(),
  fundsPurpose: z.enum(['equipment', 'inventory', 'expansion', 'working_capital']),
  salesHistory: z.enum(['<1yr', '1-3yr', '3+yr']),
  revenueLastYear: z.number().nonnegative(),
  averageMonthlyRevenue: z.number().nonnegative(),
  accountsReceivableBalance: z.number().nonnegative(),
  fixedAssetsValue: z.number().nonnegative(),
  equipmentValue: z.number().nonnegative().optional(),

  // Stage 2 - Product Selection
  selectedProductId: z.string().optional(),
  selectedProductName: z.string().optional(),
  selectedLenderName: z.string().optional(),
  matchScore: z.number().optional(),
  selectedCategory: z.string().optional(),
  selectedCategoryName: z.string().optional(),

  // Stage 3 – Business Details
  businessName: z.string(),
  businessAddress: z.string(),
  businessCity: z.string(),
  businessState: z.string(),
  businessZipCode: z.string(),
  businessPhone: phoneSchema,
  businessEmail: z.string().email().optional(),
  businessWebsite: z.string().url().optional(),
  businessStartDate: z.string(),
  businessStructure: z.enum(['sole_proprietorship', 'partnership', 'llc', 'corporation', 's_corp', 'non_profit']),
  employeeCount: z.number().int().positive(),
  estimatedYearlyRevenue: z.number().optional(),
  incorporationDate: z.string().optional(),
  taxId: z.string().optional(),

  // Stage 4A - Financial Information
  annualRevenue: z.string().optional(),
  monthlyExpenses: z.string().optional(),
  numberOfEmployees: z.string().optional(),
  totalAssets: z.string().optional(),
  totalLiabilities: z.string().optional(),

  // Stage 4B – Applicant Information
  title: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  personalEmail: z.string().email(),
  personalPhone: phoneSchema,
  dateOfBirth: z.string(),
  socialSecurityNumber: z.string(),
  ownershipPercentage: z.string(),
  creditScore: z.enum(['unknown', 'excellent_750_plus', 'good_700_749', 'fair_650_699', 'poor_600_649', 'very_poor_below_600']),
  personalAnnualIncome: z.string(),
  applicantAddress: z.string(),
  applicantCity: z.string(),
  applicantState: z.string(),
  applicantPostalCode: z.string(),
  yearsWithBusiness: z.string(),
  previousLoans: z.enum(['yes', 'no']),
  bankruptcyHistory: z.enum(['yes', 'no']),

  // Partner Information (conditional on ownership < 100%)
  partnerFirstName: z.string().optional(),
  partnerLastName: z.string().optional(),
  partnerEmail: z.string().email().optional(),
  partnerPhone: phoneSchema.optional(),
  partnerDateOfBirth: z.string().optional(),
  partnerSinSsn: z.string().optional(),
  partnerOwnershipPercentage: z.string().optional(),
  partnerCreditScore: z.enum(['unknown', 'excellent_750_plus', 'good_700_749', 'fair_650_699', 'poor_600_649', 'very_poor_below_600']).optional(),
  partnerPersonalAnnualIncome: z.string().optional(),
  partnerAddress: z.string().optional(),
  partnerCity: z.string().optional(),
  partnerState: z.string().optional(),
  partnerPostalCode: z.string().optional(),

  // Stage 5 - Document Upload
  uploadedDocuments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    type: z.string(),
    documentType: z.string(),
    status: z.string(),
  })).optional(),
  bypassedDocuments: z.boolean().optional(),

  // Stage 6 – Signature & Submission
  signedAt: z.string().optional(),
  documentId: z.string().optional(),
  signingUrl: z.string().optional(),
  applicationId: z.string().optional(),
  submissionStatus: z.string().optional(),
  submittedAt: z.string().optional(),
  completed: z.boolean().optional(),
  
  // Stage 7 – Consents
  communicationConsent: z.boolean().refine((v) => v, {
    message: 'You must consent to communication',
  }),
  documentMaintenanceConsent: z.boolean().refine((v) => v, {
    message: 'You must consent to document maintenance',
  }),
});

// Infer the type from the schema
export type ApplicationForm = z.infer<typeof ApplicationFormSchema>;

/* ------------------------------------------------------------------
   STEP-SPECIFIC SCHEMAS (FOR FORM VALIDATION)
-------------------------------------------------------------------*/
export const step1Schema = z.object({
  businessLocation: z.enum(['US', 'CA']),
  headquarters: z.enum(['US', 'CA']),
  industry: z.string(),
  lookingFor: z.enum(['capital', 'equipment', 'both']),
  fundingAmount: z.number().positive(),
  fundsPurpose: z.string(),
  salesHistory: z.enum(['<1yr', '1-2yr', '2+yr']),
  revenueLastYear: z.number().nonnegative(),
  averageMonthlyRevenue: z.number().nonnegative(),
  accountsReceivableBalance: z.number().nonnegative(),
  fixedAssetsValue: z.number().nonnegative(),
  equipmentValue: z.number().nonnegative().optional(),
});

export const step2Schema = z.object({
  selectedProductId: z.string().optional(),
  selectedProductName: z.string().optional(),
  selectedLenderName: z.string().optional(),
});

export const step3Schema = z.object({
  businessName: z.string(),
  businessAddress: z.string(),
  businessCity: z.string(),
  businessState: z.string(),
  businessZipCode: z.string(),
  businessPhone: phoneSchema,
  businessEmail: z.string().email().optional(),
  businessWebsite: z.string().url().optional(),
  businessStartDate: z.string(),
  businessStructure: z.enum(['sole_proprietorship', 'partnership', 'llc', 'corporation', 's_corp', 'non_profit']),
  employeeCount: z.number().int().positive(),
  estimatedYearlyRevenue: z.number().optional(),
});

export const step4Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  personalEmail: z.string().email('Valid email is required'),
  personalPhone: phoneSchema,
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  socialSecurityNumber: z.string().min(1, 'SSN/SIN is required'),
  ownershipPercentage: z.string().min(1, 'Ownership percentage is required'),
  creditScore: z.enum(['unknown', 'excellent_750_plus', 'good_700_749', 'fair_650_699', 'poor_600_649', 'very_poor_below_600']),
  personalAnnualIncome: z.string().min(1, 'Personal annual income is required'),
  applicantAddress: z.string().min(1, 'Address is required'),
  applicantCity: z.string().min(1, 'City is required'),
  applicantState: z.string().min(1, 'State is required'),
  applicantPostalCode: z.string().min(1, 'Postal code is required'),
  yearsWithBusiness: z.string().min(1, 'Years with business is required'),
  previousLoans: z.enum(['yes', 'no']),
  bankruptcyHistory: z.enum(['yes', 'no']),
  // Partner fields (conditional)
  partnerFirstName: z.string().optional(),
  partnerLastName: z.string().optional(),
  partnerEmail: z.string().email().optional(),
  partnerPhone: phoneSchema.optional(),
  partnerDateOfBirth: z.string().optional(),
  partnerSinSsn: z.string().optional(),
  partnerOwnershipPercentage: z.string().optional(),
  partnerCreditScore: z.enum(['unknown', 'excellent_750_plus', 'good_700_749', 'fair_650_699', 'poor_600_649', 'very_poor_below_600']).optional(),
  partnerPersonalAnnualIncome: z.string().optional(),
  partnerAddress: z.string().optional(),
  partnerCity: z.string().optional(),
  partnerState: z.string().optional(),
  partnerPostalCode: z.string().optional(),
});

export const step6Schema = z.object({
  signedAt: z.string().optional(),
  documentId: z.string().optional(),
  signingUrl: z.string().optional(),
  applicationId: z.string().optional(),
  completed: z.boolean().optional(),
  submissionStatus: z.string().optional(),
  signUrl: z.string().optional(),
  submittedAt: z.string().optional(),
});

export type ApplicationForm = z.infer<typeof ApplicationFormSchema>;

/* ------------------------------------------------------------------
   STEP SCHEMAS (for React‑Hook‑Form per page validation)
-------------------------------------------------------------------*/
export const Step1Schema = ApplicationFormSchema.pick({
  businessLocation: true,
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
  applicantAddress: true,
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

// Export validation helpers (aliases for backward compatibility)
export const phoneValidation = phoneSchema;
export const postalValidation = postalSchema;