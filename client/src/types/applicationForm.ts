// Local ApplicationForm type to avoid deep import chains
// Extracted from shared/schema to fix build timeout

export interface ApplicationForm {
  // Step 1: Financial Profile
  requestedAmount?: number;
  use_of_funds?: string;
  fundsPurpose?: string;
  headquarters?: string;
  lookingFor?: 'capital' | 'equipment' | 'both';
  accountsReceivableBalance?: number;
  fixedAssetsValue?: number;
  
  // Step 3: Business Details
  operatingName?: string;
  legalName?: string;
  businessName?: string;
  businessStreetAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessPostalCode?: string;
  businessPhone?: string;
  businessWebsite?: string;
  businessStartDate?: string;
  incorporationDate?: string;
  
  // Step 4: Applicant Information
  firstName?: string;
  lastName?: string;
  applicantFirstName?: string;
  applicantLastName?: string;
  email?: string;
  applicantEmail?: string;
  phone?: string;
  applicantPhone?: string;
  ownershipPercentage?: number;
  dob?: string;
  sin?: string;
  applicantAddress?: string;
  applicantCity?: string;
  applicantState?: string;
  applicantPostalCode?: string;
  
  // Partner Information (optional)
  partnerFirstName?: string;
  partnerLastName?: string;
  partnerEmail?: string;
  partnerPhone?: string;
  partnerOwnershipPercentage?: number;
  partnerDob?: string;
  partnerSin?: string;
  
  // Additional fields
  [key: string]: any;
}