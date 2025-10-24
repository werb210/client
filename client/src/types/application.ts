export interface UploadedDocument {
  name: string;
  documentType?: string;
  file?: File;
  size?: number;
  id?: string;
}

export interface ApplicationForm {
  applicationId?: string;
  businessName?: string;
  operatingName?: string;
  legalName?: string;
  businessLocation?: string;
  businessStreetAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessPostalCode?: string;
  businessStructure?: string;
  businessPhone?: string;
  businessWebsite?: string;
  industry?: string;
  country?: string;
  amountRequested?: number;
  fundingAmount?: number | string;
  fundsPurpose?: string;
  revenueLastYear?: number | string;
  avgMonthlyRevenue?: number | string;
  selectedCategory?: string;
  firstName?: string;
  lastName?: string;
  applicantFirstName?: string;
  applicantLastName?: string;
  email?: string;
  applicantEmail?: string;
  phone?: string;
  applicantPhone?: string;
  hasDocuments?: boolean;
  bypassDocuments?: boolean;
  uploadedFiles?: UploadedDocument[];
  completedSteps?: string[];
  step1Completed?: boolean;
  step2Completed?: boolean;
  step3Completed?: boolean;
  step4Completed?: boolean;
  step6Completed?: boolean;
  signatureCompleted?: boolean;
  step5DocumentUpload?: {
    uploadedFiles?: UploadedDocument[];
    files?: UploadedDocument[];
    hasDocuments?: boolean;
    bypassDocuments?: boolean;
    submissionMode?: 'with_documents' | 'without_documents';
  };
  step3?: {
    operatingName?: string;
    legalName?: string;
    businessStructure?: string;
  };
  step4?: {
    applicationId?: string;
    firstName?: string;
    lastName?: string;
    applicantFirstName?: string;
    applicantLastName?: string;
    email?: string;
    phone?: string;
  };
  step2?: {
    selectedCategory?: string;
  };
  step1?: {
    businessLocation?: string;
    fundingAmount?: number | string;
    fundsPurpose?: string;
    revenueLastYear?: number | string;
    industry?: string;
  };
  step6Authorization?: Record<string, unknown>;
  [key: string]: any;
}

export type ApplicationFormUpdate = Partial<ApplicationForm>;
