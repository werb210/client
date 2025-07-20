// Document Mapping System for 22 Supported Document Types
// Updated July 18, 2025 - Staff Application Integration

import { DocumentType, SUPPORTED_DOCUMENT_TYPES } from './documentTypes';

// Enhanced document requirements by financing category
export const ENHANCED_DOCUMENT_REQUIREMENTS: Record<string, DocumentType[]> = {
  "line_of_credit": [
    "bank_statements",
    "tax_returns", 
    "financial_statements",
    "business_license",
    "articles_of_incorporation",
    "accounts_receivable",
    "cash_flow_statement",
    "personal_guarantee"
  ],
  "term_loan": [
    "bank_statements",
    "tax_returns",
    "financial_statements", 
    "business_license",
    "articles_of_incorporation",
    "business_plan",
    "personal_financial_statement",
    "collateral_docs"
  ],
  "equipment_financing": [
    "bank_statements",
    "tax_returns",
    "financial_statements",
    "business_license", 
    "articles_of_incorporation",
    "equipment_quote",
    "collateral_docs"
  ],
  "invoice_factoring": [
    "bank_statements",
    "tax_returns",
    "financial_statements",
    "business_license",
    "articles_of_incorporation", 
    "invoice_samples",
    "accounts_receivable"
  ],
  "working_capital": [
    "bank_statements",
    "tax_returns",
    "financial_statements",
    "business_license",
    "articles_of_incorporation",
    "accounts_receivable",
    "cash_flow_statement"
  ],
  "purchase_order_financing": [
    "bank_statements",
    "tax_returns",
    "financial_statements",
    "business_license",
    "articles_of_incorporation",
    "supplier_agreement"
  ],
  "asset_based_lending": [
    "bank_statements",
    "tax_returns", 
    "financial_statements",
    "business_license",
    "articles_of_incorporation",
    "collateral_docs",
    "accounts_receivable"
  ],
  "sba_loan": [
    "bank_statements",
    "tax_returns",
    "financial_statements",
    "business_license",
    "articles_of_incorporation",
    "business_plan",
    "personal_financial_statement",
    "personal_guarantee"
  ]
};

// Document name normalization for legacy compatibility
export const DOCUMENT_NAME_MAPPING: Record<string, DocumentType> = {
  // Bank Statements variations
  "bank statements": "bank_statements",
  "bank statements (6 months)": "bank_statements",
  "banking statements": "bank_statements",
  "bank account statements": "bank_statements",
  
  // Tax Returns variations
  "business tax returns": "tax_returns",
  "tax returns (2-3 years)": "tax_returns",
  "business tax returns (2-3 years)": "tax_returns",
  "corporate tax returns": "tax_returns",
  
  // Accountant Prepared Financial Statements variations - use unique category
  "accountant prepared financial statements": "accountant_prepared_statements",
  "accountant prepared financial statements (p&l and balance sheet)": "accountant_prepared_statements",
  "audited financial statements": "accountant_prepared_statements",
  
  // General Financial Statements variations
  "financial statements (p&l and balance sheet)": "financial_statements",
  "financial statements": "financial_statements",
  
  // Business License variations
  "business license": "business_license",
  "business operating license": "business_license",
  "professional license": "business_license",
  
  // Articles of Incorporation variations
  "articles of incorporation": "articles_of_incorporation",
  "incorporation documents": "articles_of_incorporation",
  "corporate formation documents": "articles_of_incorporation",
  
  // Voided Check variations
  "voided check": "void_pad",
  "void check": "void_pad",
  "cancelled check": "void_pad",
  "bank verification": "void_pad",
  
  // Equipment Quote variations
  "equipment quote": "equipment_quote",
  "equipment quote or invoice": "equipment_quote",
  "equipment invoice": "equipment_quote",
  "equipment specifications": "equipment_quote",
  
  // Personal Financial Statement variations
  "personal financial statement": "personal_financial_statement",
  "personal financial statements": "personal_financial_statement",
  "personal balance sheet": "personal_financial_statement",
  
  // Personal Guarantee variations
  "personal guarantee": "personal_guarantee",
  "personal guaranty": "personal_guarantee",
  "guarantee form": "personal_guarantee",
  
  // Accounts Receivable variations
  "accounts receivable": "accounts_receivable",
  "accounts receivable aging report": "accounts_receivable",
  "customer receivables": "accounts_receivable",
  "ar aging": "accounts_receivable",
  
  // Invoice Samples variations
  "invoice samples": "invoice_samples",
  "invoice samples (90 days)": "invoice_samples",
  "sample invoices": "invoice_samples",
  "customer invoices": "invoice_samples",
  
  // Cash Flow Statement variations
  "cash flow statement": "cash_flow_statement",
  "cash flow projections": "cash_flow_statement",
  "cash flow analysis": "cash_flow_statement",
  
  // Business Plan variations
  "business plan": "business_plan",
  "business plan with use of funds": "business_plan",
  "business plan and projections": "business_plan",
  
  // Collateral Documents variations
  "collateral documentation": "collateral_docs",
  "collateral documents": "collateral_docs",
  "asset documentation": "collateral_docs",
  "security documents": "collateral_docs",
  
  // Profit & Loss variations
  "profit and loss statement": "profit_loss_statement",
  "p&l statement": "profit_loss_statement",
  "income statement": "profit_loss_statement",
  "profit loss statement": "profit_loss_statement",
  
  // Balance Sheet variations
  "balance sheet": "balance_sheet",
  "statement of financial position": "balance_sheet",
  "balance sheet statement": "balance_sheet",
  
  // Accounts Payable variations
  "accounts payable": "accounts_payable",
  "accounts payable aging": "accounts_payable",
  "payables report": "accounts_payable",
  
  // Supplier Agreement variations
  "supplier agreement": "supplier_agreement",
  "supplier contracts": "supplier_agreement",
  "vendor agreements": "supplier_agreement",
  
  // Driver's License variations
  "driver's license": "drivers_license_front_back",
  "drivers license": "drivers_license_front_back",
  "driver license front and back": "drivers_license_front_back",
  
  // Proof of Identity variations
  "proof of identity": "proof_of_identity",
  "identification documents": "proof_of_identity",
  "government id": "proof_of_identity",
  
  // Other variations
  "other documents": "other",
  "additional documents": "other",
  "miscellaneous documents": "other",
  
  // Signed Application variations
  "signed application": "signed_application",
  "completed application": "signed_application",
  "loan application": "signed_application"
};

// Normalize document name to supported type
export const normalizeDocumentName = (docName: string): DocumentType => {
  const normalized = docName.toLowerCase().trim();
  
  // Check direct mapping first
  if (DOCUMENT_NAME_MAPPING[normalized]) {
    return DOCUMENT_NAME_MAPPING[normalized];
  }
  
  // Check if it's already a valid document type
  if (SUPPORTED_DOCUMENT_TYPES.includes(normalized as DocumentType)) {
    return normalized as DocumentType;
  }
  
  // Fallback patterns
  if (normalized.includes('bank') && normalized.includes('statement')) {
    return 'bank_statements';
  }
  if (normalized.includes('tax') && normalized.includes('return')) {
    return 'tax_returns';
  }
  if (normalized.includes('financial') && normalized.includes('statement')) {
    return 'financial_statements';
  }
  if (normalized.includes('business') && normalized.includes('license')) {
    return 'business_license';
  }
  if (normalized.includes('article') && normalized.includes('incorporation')) {
    return 'articles_of_incorporation';
  }
  if (normalized.includes('void') && (normalized.includes('check') || normalized.includes('pad'))) {
    return 'void_pad';
  }
  if (normalized.includes('equipment') && normalized.includes('quote')) {
    return 'equipment_quote';
  }
  if (normalized.includes('personal') && normalized.includes('financial')) {
    return 'personal_financial_statement';
  }
  if (normalized.includes('personal') && normalized.includes('guarantee')) {
    return 'personal_guarantee';
  }
  if (normalized.includes('accounts') && normalized.includes('receivable')) {
    return 'accounts_receivable';
  }
  if (normalized.includes('invoice') && normalized.includes('sample')) {
    return 'invoice_samples';
  }
  if (normalized.includes('cash') && normalized.includes('flow')) {
    return 'cash_flow_statement';
  }
  if (normalized.includes('business') && normalized.includes('plan')) {
    return 'business_plan';
  }
  if (normalized.includes('collateral')) {
    return 'collateral_docs';
  }
  if (normalized.includes('profit') && normalized.includes('loss')) {
    return 'profit_loss_statement';
  }
  if (normalized.includes('balance') && normalized.includes('sheet')) {
    return 'balance_sheet';
  }
  if (normalized.includes('accounts') && normalized.includes('payable')) {
    return 'accounts_payable';
  }
  if (normalized.includes('supplier') && normalized.includes('agreement')) {
    return 'supplier_agreement';
  }
  if (normalized.includes('driver') && normalized.includes('license')) {
    return 'drivers_license_front_back';
  }
  if (normalized.includes('proof') && normalized.includes('identity')) {
    return 'proof_of_identity';
  }
  if (normalized.includes('signed') && normalized.includes('application')) {
    return 'signed_application';
  }
  
  // Default to 'other' if no match found
  return 'other';
};

// Get document requirements for a given category
export const getDocumentRequirements = (category: string): DocumentType[] => {
  return ENHANCED_DOCUMENT_REQUIREMENTS[category] || [];
};

// Validate document type
export const isValidDocumentType = (type: string): type is DocumentType => {
  return SUPPORTED_DOCUMENT_TYPES.includes(type as DocumentType);
};