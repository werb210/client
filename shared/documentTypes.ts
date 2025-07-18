// Complete List of 22 Supported Document Types from Staff Application
// Updated July 18, 2025 - Staff Application Verified

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
  'financial_statements',
  'invoice_samples',
  'other',
  'personal_financial_statement',
  'personal_guarantee',
  'profit_loss_statement',
  'proof_of_identity',
  'signed_application',
  'supplier_agreement',
  'tax_returns',
  'void_pad'
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
  'financial_statements': 'Financial Statements',
  'invoice_samples': 'Invoice Samples',
  'other': 'Other Documents',
  'personal_financial_statement': 'Personal Financial Statement',
  'personal_guarantee': 'Personal Guarantee',
  'profit_loss_statement': 'Profit & Loss Statement',
  'proof_of_identity': 'Proof of Identity',
  'signed_application': 'Signed Application',
  'supplier_agreement': 'Supplier Agreement',
  'tax_returns': 'Tax Returns',
  'void_pad': 'Voided Check'
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
  'financial_statements': 'Comprehensive financial reports (P&L, Balance Sheet)',
  'invoice_samples': 'Sample invoices showing billing patterns',
  'other': 'Additional documents as requested',
  'personal_financial_statement': 'Personal assets and liabilities statement',
  'personal_guarantee': 'Personal guarantee for business debt',
  'profit_loss_statement': 'Statement of revenues and expenses',
  'proof_of_identity': 'Government-issued identification documents',
  'signed_application': 'Completed and signed loan application',
  'supplier_agreement': 'Contracts with key suppliers',
  'tax_returns': 'Business tax returns (typically 2-3 years)',
  'void_pad': 'Voided check for bank account verification'
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
  'financial_statements': 3, // P&L, Balance Sheet, Cash Flow
  'invoice_samples': 3, // Sample invoices
  'other': 1,
  'personal_financial_statement': 1,
  'personal_guarantee': 1,
  'profit_loss_statement': 1,
  'proof_of_identity': 1,
  'signed_application': 1,
  'supplier_agreement': 1,
  'tax_returns': 2, // Typically 2-3 years
  'void_pad': 1
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