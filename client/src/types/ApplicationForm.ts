// Client-side Application Form types for Steps 3-6 workflow
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ApplicationForm {
  // Business Details (Step 3)
  legalName: string;
  industry: string;
  ein: string;
  entityType: string;
  address: Address;
  businessPhone: string;
  businessEmail: string;
  businessWebsite?: string;
  businessDescription: string;
  numberOfEmployees: number;
  primaryBankName: string;
  bankingRelationshipLength: string;
  businessRegistrationDate: string;

  // Financial Info (Step 4)
  annualRevenue: number;
  averageBankBalance: number;
  requestedAmount: number;
  useOfFunds: string;
  personalCreditScore: string;
  businessCreditScore: string;
  bankruptcyHistory: string;
  ownershipPercentage: number;

  // Applicant Details (Step 4)
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  ssn: string;
  dateOfBirth: string;
  homeAddress: Address;
}

export interface DocStatus {
  category: string;
  fileName: string;
  status: 'uploading' | 'uploaded' | 'error';
  uploadedAt?: string;
  fileId?: string;
}

export interface FinalizeResponse {
  applicationId: string;
  signUrl: string;
  status: 'signing_sent';
}

// Document categories that match staff backend expectations
export const REQUIRED_DOC_CATEGORIES = [
  'bank_statements',
  'tax_returns',
  'financial_statements',
  'business_license',
  'articles_of_incorporation',
  'voided_check'
] as const;

export type DocumentCategory = typeof REQUIRED_DOC_CATEGORIES[number];