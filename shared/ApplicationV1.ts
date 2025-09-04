// shared/ApplicationV1.ts
export type CurrencyNumber = number; // store as number in cents or whole units—be consistent

export interface ApplicationV1 {
  applicationId?: string;
  
  // Step 1 – Financial Profile
  businessLocation?: string;
  headquarters?: string;
  headquartersState?: string;
  industry?: string;
  lookingFor?: 'capital' | 'equipment' | 'invoice_factoring' | string;
  fundingAmount?: CurrencyNumber;
  fundsPurpose?: string;
  salesHistory?: string;
  revenueLastYear?: CurrencyNumber;
  averageMonthlyRevenue?: CurrencyNumber;
  accountsReceivableBalance?: CurrencyNumber;
  fixedAssetsValue?: CurrencyNumber;
  equipmentValue?: CurrencyNumber;

  // Step 2 – Product Selection
  selectedProductId?: string;
  selectedProductName?: string;
  selectedLenderName?: string;
  matchScore?: number;
  selectedCategory?: string;
  selectedCategoryName?: string;

  // Step 3 – Business Details
  businessName?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessZipCode?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  businessStartDate?: string;
  businessStructure?: string;
  employeeCount?: number;
  estimatedYearlyRevenue?: number;
  incorporationDate?: string;
  taxId?: string;

  // Step 4A - Financial Information
  annualRevenue?: string;
  monthlyExpenses?: string;
  numberOfEmployees?: number;
  totalAssets?: string;
  totalLiabilities?: string;

  // Step 4B – Applicant Information
  title?: string;
  firstName?: string;
  lastName?: string;
  personalEmail?: string;
  personalPhone?: string;
  dateOfBirth?: string;
  socialSecurityNumber?: string;
  ownershipPercentage?: string;
  creditScore?: string;
  personalAnnualIncome?: string;
  applicantAddress?: string;
  applicantCity?: string;
  applicantState?: string;
  applicantPostalCode?: string;
  yearsWithBusiness?: string;
  previousLoans?: string;
  bankruptcyHistory?: string;

  // Partner Information
  partnerFirstName?: string;
  partnerLastName?: string;
  partnerEmail?: string;
  partnerPhone?: string;
  partnerDateOfBirth?: string;
  partnerSinSsn?: string;
  partnerOwnershipPercentage?: string;
  partnerCreditScore?: string;
  partnerPersonalAnnualIncome?: string;
  partnerAddress?: string;
  partnerCity?: string;
  partnerState?: string;
  partnerPostalCode?: string;

  // Step 5 - Document Upload
  uploadedDocuments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    documentType: string;
    status: string;
  }>;
  bypassedDocuments?: boolean;

  // Step 6 – Signature & Submission
  signedAt?: string;
  documentId?: string;
  signingUrl?: string;
  submissionStatus?: string;
  submittedAt?: string;
  completed?: boolean;
  
  // Step 7 – Consents
  communicationConsent?: boolean;
  documentMaintenanceConsent?: boolean;

  // …keep room for later fields
  [k: string]: unknown;
}