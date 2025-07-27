/**
 * Document Categories for Upload Dropdown
 * Updated to use canonical 30-entry document types from Staff App truth source
 * Date: January 27, 2025
 */

// Staff App canonical 30-entry document types truth source
export const DOCUMENT_CATEGORIES = [
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
];

// Display labels mapping for UI dropdown
export const DISPLAY_LABELS: Record<string, string> = {
  'accounts_payable': 'Accounts Payable',
  'accounts_receivable': 'Accounts Receivable',
  'account_prepared_financials': 'Accountant Prepared Financial Statements',
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
  'financial_statements': 'Financial Statements',
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

// Helper function to get label by value
export const getDocumentLabel = (value: string): string => {
  return DISPLAY_LABELS[value] || value;
};

// Helper function to get value by label
export const getDocumentValue = (label: string): string => {
  const entry = Object.entries(DISPLAY_LABELS).find(([_, displayLabel]) => displayLabel === label);
  return entry?.[0] || label;
};

// All document type values for validation
export const ALL_DOCUMENT_VALUES = DOCUMENT_CATEGORIES;