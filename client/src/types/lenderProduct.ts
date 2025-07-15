// Local type definitions to avoid deep import chains
// Extracted from shared/lenderProductSchema to fix build timeout

export interface LenderProduct {
  id: string;
  name: string;
  lender: string;
  category: string;
  subcategory?: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  geography?: string[];
  country?: string;
  requiredDocuments?: string[];
  doc_requirements?: string[];
  documentRequirements?: string[];
  required_documents?: string[];
  [key: string]: any; // Allow additional fields for flexibility
}

export type StaffLenderProduct = LenderProduct;