// Local type definitions to avoid deep import chains
// Extracted from shared/lenderProductSchema to fix build timeout

export interface LenderProduct {
  id: string;
  productName: string;
  lenderName: string;
  productCategory: string;
  subcategory?: string;
  description?: string;
  minimumLendingAmount?: number;
  maximumLendingAmount?: number;
  countryOffered?: string;
  isActive?: boolean;
  geography?: string[];
  requiredDocuments?: string[];
  doc_requirements?: string[];
  documentRequirements?: string[];
  required_documents?: string[];
  [key: string]: any; // Allow additional fields for flexibility
}

export type StaffLenderProduct = LenderProduct;