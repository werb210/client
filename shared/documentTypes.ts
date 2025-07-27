// Complete List of 22 Supported Document Types from Staff Application
// Updated July 18, 2025 - Staff Application Verified

export function normalizeDocumentName(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, '_');
}

export const SUPPORTED_DOCUMENT_TYPES = [
  'accounts_payable',
  'accounts_receivable', 
  'articles_of_incorporation',
  'balance_sheet',
  'bank_statements',
  'business_license',
  'business_plan',
  'cash_flow_statement',
  'collateral_docs',
  'drivers_license_front_back',
  'equipment_quote',
  'accountant_financials',
  'invoice_samples',
  'other',
  'personal_financials',
  'personal_guarantee',
  'profit_and_loss',
  'proof_of_identity',
  'signed_application',
  'supplier_agreement',
  'tax_returns',
  'void_cheque'
] as const;

export type DocumentType = typeof SUPPORTED_DOCUMENT_TYPES[number];

// Document type display names for UI
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'accounts_payable': 'Accounts Payable',
  'accounts_receivable': 'Accounts Receivable',
  'articles_of_incorporation': 'Articles of Incorporation',
  'balance_sheet': 'Balance Sheet',
  'bank_statements': 'Bank Statements',
  'business_license': 'Business License',
  'business_plan': 'Business Plan',
  'cash_flow_statement': 'Cash Flow Statement',
  'collateral_docs': 'Collateral Documents',
  'drivers_license_front_back': 'Driver\'s License (Front & Back)',
  'equipment_quote': 'Equipment Quote',
  'accountant_financials': 'Accountant Prepared Financial Statements',
  'invoice_samples': 'Invoice Samples',
  'other': 'Other Documents',
  'personal_financials': 'Personal Financial Statement',
  'personal_guarantee': 'Personal Guarantee',
  'profit_and_loss': 'Profit & Loss Statement',
  'proof_of_identity': 'Proof of Identity',
  'signed_application': 'Signed Application',
  'supplier_agreement': 'Supplier Agreement',
  'tax_returns': 'Tax Returns',
  'void_cheque': 'Voided Check'
};

// Document type descriptions for user guidance
export const DOCUMENT_TYPE_DESCRIPTIONS: Record<DocumentType, string> = {
  'accounts_payable': 'Outstanding bills and invoices owed to suppliers',
  'accounts_receivable': 'Outstanding invoices from customers',
  'articles_of_incorporation': 'Legal documents forming your corporation',
  'balance_sheet': 'Statement of assets, liabilities, and equity',
  'bank_statements': 'Recent bank account statements (typically 6 months)',
  'business_license': 'Government-issued business operating license',
  'business_plan': 'Detailed business plan including financial projections',
  'cash_flow_statement': 'Analysis of cash inflows and outflows',
  'collateral_docs': 'Documentation for assets securing the loan',
  'drivers_license_front_back': 'Government-issued photo identification',
  'equipment_quote': 'Quote or invoice for equipment financing',
  'accountant_financials': 'Professional financial statements prepared by a certified accountant (P&L, Balance Sheet, Cash Flow)',
  'invoice_samples': 'Sample invoices showing billing patterns',
  'other': 'Additional documents as requested',
  'personal_financials': 'Personal assets and liabilities statement',
  'personal_guarantee': 'Personal guarantee for business debt',
  'profit_and_loss': 'Statement of revenues and expenses',
  'proof_of_identity': 'Government-issued identification documents',
  'signed_application': 'Completed and signed loan application',
  'supplier_agreement': 'Contracts with key suppliers',
  'tax_returns': 'Business tax returns (typically 2-3 years)',
  'void_cheque': 'Voided check for bank account verification'
};

// Document quantity requirements
export const DOCUMENT_QUANTITIES: Record<DocumentType, number> = {
  'accounts_payable': 1,
  'accounts_receivable': 1,
  'articles_of_incorporation': 1,
  'balance_sheet': 1,
  'bank_statements': 6, // Typically 6 months
  'business_license': 1,
  'business_plan': 1,
  'cash_flow_statement': 1,
  'collateral_docs': 1,
  'drivers_license_front_back': 2, // Front and back
  'equipment_quote': 1,
  'accountant_financials': 3, // P&L, Balance Sheet, Cash Flow
  'invoice_samples': 3, // Sample invoices
  'other': 1,
  'personal_financials': 1,
  'personal_guarantee': 1,
  'profit_and_loss': 1,
  'proof_of_identity': 1,
  'signed_application': 1,
  'supplier_agreement': 1,
  'tax_returns': 2, // Typically 2-3 years
  'void_cheque': 1
};

// Utility functions
export const getDocumentLabel = (type: DocumentType): string => {
  return DOCUMENT_TYPE_LABELS[type] || type;
};

export const getDocumentDescription = (type: DocumentType): string => {
  return DOCUMENT_TYPE_DESCRIPTIONS[type] || 'Document required for application';
};

export const getDocumentQuantity = (type: DocumentType): number => {
  return DOCUMENT_QUANTITIES[type] || 1;
};

// Validation function
export const isValidDocumentType = (type: string): type is DocumentType => {
  return SUPPORTED_DOCUMENT_TYPES.includes(type as DocumentType);
};