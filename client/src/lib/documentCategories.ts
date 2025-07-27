/**
 * Document Categories for Upload Dropdown
 * Updated to match backend enum names exactly
 * Date: January 27, 2025
 */

export const DOCUMENT_CATEGORIES = [
  { value: 'accounts_payable', label: 'Accounts Payable' },
  { value: 'accounts_receivable', label: 'Accounts Receivable' },
  { value: 'articles_of_incorporation', label: 'Articles of Incorporation' },
  { value: 'balance_sheet', label: 'Balance Sheet' },
  { value: 'bank_statements', label: 'Bank Statements' },
  { value: 'business_license', label: 'Business License' },
  { value: 'business_plan', label: 'Business Plan' },
  { value: 'cash_flow_statement', label: 'Cash Flow Statement' },
  { value: 'collateral_docs', label: 'Collateral Documents' },
  { value: 'drivers_license_front_back', label: 'Driver\'s License (Front & Back)' },
  { value: 'equipment_quote', label: 'Equipment Quote' },
  { value: 'accountant_financials', label: 'Accountant Prepared Financials' },
  { value: 'invoice_samples', label: 'Invoice Samples' },
  { value: 'other', label: 'Other Documents' },
  { value: 'personal_financials', label: 'Personal Financial Statement' },
  { value: 'personal_guarantee', label: 'Personal Guarantee' },
  { value: 'profit_and_loss', label: 'Profit & Loss Statement' },
  { value: 'proof_of_identity', label: 'Proof of Identity' },
  { value: 'signed_application', label: 'Signed Application' },
  { value: 'supplier_agreement', label: 'Supplier Agreement' },
  { value: 'tax_returns', label: 'Tax Returns' },
  { value: 'void_cheque', label: 'Voided Check' }
];

// Helper function to get label by value
export const getDocumentLabel = (value: string): string => {
  const category = DOCUMENT_CATEGORIES.find(cat => cat.value === value);
  return category?.label || value;
};

// Helper function to get value by label
export const getDocumentValue = (label: string): string => {
  const category = DOCUMENT_CATEGORIES.find(cat => cat.label === label);
  return category?.value || label;
};

// All document type values for validation
export const ALL_DOCUMENT_VALUES = DOCUMENT_CATEGORIES.map(cat => cat.value);