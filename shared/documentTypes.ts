// Complete List of 22 Supported Document Types from Staff Application
// Updated July 18, 2025 - Staff Application Verified

export function normalizeDocumentName(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, '_');
}

export const SUPPORTED_DOCUMENT_TYPES = [
  'accounts_payable',
  'accounts_receivable',
  'account_prepared_financials',
  'ap',
  'ar', 
  'articles_of_incorporation',
  'balance_sheet',
  'bank_statements',
  'business_license',
  'business_plan',
  'cash_flow_statement',
  'collateral_docs',
  'debt_schedule',
  'drivers_license_front_back',
  'equipment_quote',
  'financial_statements',
  'income_statement',
  'invoice_samples',
  'lease_agreements',
  'other',
  'personal_financial_statement',
  'personal_guarantee',
  'profit_and_loss_statement',
  'proof_of_identity',
  'purchase_orders',
  'signed_application',
  'supplier_agreement',
  'tax_returns',
  'trade_references',
  'void_pad'
] as const;

export type DocumentType = typeof SUPPORTED_DOCUMENT_TYPES[number];

// Document type display names for UI
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'accounts_payable': 'Accounts Payable',
  'accounts_receivable': 'Accounts Receivable',
  'account_prepared_financials': 'Financial Statements',
  'ap': 'Accounts Payable (AP)',
  'ar': 'Accounts Receivable (AR)',
  'articles_of_incorporation': 'Articles of Incorporation',
  'balance_sheet': 'Balance Sheet',
  'bank_statements': 'Bank Statements',
  'business_license': 'Business License',
  'business_plan': 'Business Plan',
  'cash_flow_statement': 'Cash Flow Statement',
  'collateral_docs': 'Collateral Documents',
  'debt_schedule': 'Debt Schedule',
  'drivers_license_front_back': 'Driver\'s License (Front & Back)',
  'equipment_quote': 'Equipment Quote',
  'financial_statements': 'Financial Statements (Legacy)',
  'income_statement': 'Income Statement',
  'invoice_samples': 'Invoice Samples',
  'lease_agreements': 'Lease Agreements',
  'other': 'Other Documents',
  'personal_financial_statement': 'Personal Financial Statement',
  'personal_guarantee': 'Personal Guarantee',
  'profit_and_loss_statement': 'Profit & Loss Statement',
  'proof_of_identity': 'Proof of Identity',
  'purchase_orders': 'Purchase Orders',
  'signed_application': 'Signed Application',
  'supplier_agreement': 'Supplier Agreement',
  'tax_returns': 'Tax Returns',
  'trade_references': 'Trade References',
  'void_pad': 'Voided Check/PAD'
};

// Document type descriptions for user guidance
export const DOCUMENT_TYPE_DESCRIPTIONS: Record<DocumentType, string> = {
  'accounts_payable': 'Outstanding bills and invoices owed to suppliers',
  'accounts_receivable': 'Outstanding invoices from customers',
  'account_prepared_financials': 'Professional financial statements (P&L, Balance Sheet, Cash Flow) - 3 documents required',
  'ap': 'Accounts payable aging reports and outstanding bills',
  'ar': 'Accounts receivable aging reports and outstanding invoices',
  'articles_of_incorporation': 'Legal documents forming your corporation',
  'balance_sheet': 'Statement of assets, liabilities, and equity',
  'bank_statements': 'Recent bank account statements (typically 6 months)',
  'business_license': 'Government-issued business operating license',
  'business_plan': 'Detailed business plan including financial projections',
  'cash_flow_statement': 'Analysis of cash inflows and outflows',
  'collateral_docs': 'Documentation for assets securing the loan',
  'debt_schedule': 'Schedule of existing business debts and obligations',
  'drivers_license_front_back': 'Government-issued photo identification',
  'equipment_quote': 'Quote or invoice for equipment financing',
  'financial_statements': 'Compiled or reviewed financial statements',
  'income_statement': 'Statement of revenues and expenses',
  'invoice_samples': 'Sample invoices showing billing patterns',
  'lease_agreements': 'Real estate or equipment lease agreements',
  'other': 'Additional documents as requested',
  'personal_financial_statement': 'Personal assets and liabilities statement',
  'personal_guarantee': 'Personal guarantee for business debt',
  'profit_and_loss_statement': 'Statement of revenues and expenses',
  'proof_of_identity': 'Government-issued identification documents',
  'purchase_orders': 'Purchase orders from customers',
  'signed_application': 'Completed and signed loan application',
  'supplier_agreement': 'Contracts with key suppliers',
  'tax_returns': 'Business tax returns (typically 2-3 years)',
  'trade_references': 'Business references from suppliers and vendors',
  'void_pad': 'Voided check for bank account verification'
};

// Document quantity requirements
export const DOCUMENT_QUANTITIES: Record<DocumentType, number> = {
  'accounts_payable': 1,
  'accounts_receivable': 1,
  'account_prepared_financials': 3, // P&L, Balance Sheet, Cash Flow
  'ap': 1,
  'ar': 1,
  'articles_of_incorporation': 1,
  'balance_sheet': 1,
  'bank_statements': 6, // Typically 6 months
  'business_license': 1,
  'business_plan': 1,
  'cash_flow_statement': 1,
  'collateral_docs': 1,
  'debt_schedule': 1,
  'drivers_license_front_back': 2, // Front and back
  'equipment_quote': 1,
  'financial_statements': 3, // Financial statements require 3 documents
  'income_statement': 1,
  'invoice_samples': 3, // Sample invoices
  'lease_agreements': 1,
  'other': 1,
  'personal_financial_statement': 1,
  'personal_guarantee': 1,
  'profit_and_loss_statement': 1,
  'proof_of_identity': 1,
  'purchase_orders': 3, // Sample purchase orders
  'signed_application': 1,
  'supplier_agreement': 1,
  'tax_returns': 3, // Tax returns require 3 years
  'trade_references': 3, // Typically 3 references
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