/**
 * 🔒 DOCUMENT NORMALIZATION MAPPING SYSTEM
 * Maps legacy document names to canonical backend enum values from Staff App truth source
 * LOCKED: Set VITE_ALLOW_MAPPING_EDITS=true to modify
 * Last Updated: January 27, 2025
 */

// Environment check for editing permissions
const ALLOW_EDITS = import.meta.env.VITE_ALLOW_MAPPING_EDITS === 'true';

if (!ALLOW_EDITS) {
  console.warn('[LOCKED] mapToBackendDocumentType is currently locked. Set VITE_ALLOW_MAPPING_EDITS=true to modify.');
}

/**
 * Legacy to Canonical mapping from old client names to Staff App canonical enums
 * Updated to use 30-entry canonical document types from Staff Application truth source
 */
export const LEGACY_TO_CANONICAL: Record<string, string> = {
  // Critical legacy mappings to new canonical enums per CLIENT APPLICATION requirements
  'financial_statements': 'account_prepared_financials',
  'accountant_financials': 'account_prepared_financials',
  'profit_loss_statement': 'profit_and_loss_statement',
  'profit_and_loss': 'profit_and_loss_statement',
  'void_cheque': 'void_pad',
  'personal_financials': 'personal_financial_statement',
  
  // Additional legacy mappings
  'accountant_prepared_financials': 'account_prepared_financials',
  'pnl_statement': 'profit_and_loss_statement',
  'p&l_statement': 'profit_and_loss_statement',
  'voided_check': 'void_pad',
  'void_check': 'void_pad',
  'drivers_license': 'drivers_license_front_back',
  'driver_license': 'drivers_license_front_back',
  'bank_statement': 'bank_statements',
  'tax_return': 'tax_returns',
  'business_licence': 'business_license',
  'invoice_sample': 'invoice_samples',
  'incorporation_articles': 'articles_of_incorporation',
  'equipment_quotes': 'equipment_quote',
  'balance_sheets': 'balance_sheet',
  'cash_flow': 'cash_flow_statement',
  'business_plans': 'business_plan',
  'personal_guaranty': 'personal_guarantee',
  'identity_proof': 'proof_of_identity',
  'application_signed': 'signed_application',
  'supplier_agreements': 'supplier_agreement',
  'collateral_documents': 'collateral_docs',
  'collateral': 'collateral_docs',
  'other_documents': 'other',
  'miscellaneous': 'other'
};

/**
 * Master mapping from all document names to canonical backend enum values
 * Uses Staff App 30-entry truth source canonical document types
 */
const DOCUMENT_TYPE_MAP: Record<string, string> = {
  // Canonical Staff App document types (30 entries)
  'accounts_payable': 'accounts_payable',
  'accounts_receivable': 'accounts_receivable',
  'account_prepared_financials': 'account_prepared_financials',
  'ap': 'ap',
  'ar': 'ar',
  'articles_of_incorporation': 'articles_of_incorporation',
  'balance_sheet': 'balance_sheet',
  'bank_statements': 'bank_statements',
  'business_license': 'business_license',
  'business_plan': 'business_plan',
  'cash_flow_statement': 'cash_flow_statement',
  'collateral_docs': 'collateral_docs',
  'debt_schedule': 'debt_schedule',
  'drivers_license_front_back': 'drivers_license_front_back',
  'equipment_quote': 'equipment_quote',
  'financial_statements': 'financial_statements',
  'income_statement': 'income_statement',
  'invoice_samples': 'invoice_samples',
  'lease_agreements': 'lease_agreements',
  'other': 'other',
  'personal_financial_statement': 'personal_financial_statement',
  'personal_guarantee': 'personal_guarantee',
  'profit_and_loss_statement': 'profit_and_loss_statement',
  'proof_of_identity': 'proof_of_identity',
  'purchase_orders': 'purchase_orders',
  'signed_application': 'signed_application',
  'supplier_agreement': 'supplier_agreement',
  'tax_returns': 'tax_returns',
  'trade_references': 'trade_references',
  'void_pad': 'void_pad',
  
  // Legacy mappings using LEGACY_TO_CANONICAL
  ...LEGACY_TO_CANONICAL
};

/**
 * Maps display names or variations to canonical backend document types
 * @param inputName - Document name from UI or API
 * @returns Canonical backend document type
 */
export function mapToBackendDocumentType(inputName: string): string {
  if (!inputName || typeof inputName !== 'string') {
    console.warn('🚨 Invalid document type input:', inputName);
    return 'other';
  }

  // Normalize input: lowercase, trim, replace spaces/hyphens with underscores
  const normalized = inputName.toLowerCase().trim().replace(/[\s-]+/g, '_');
  
  // Direct mapping lookup
  const mapped = DOCUMENT_TYPE_MAP[normalized];
  
  if (mapped) {
    console.log(`📋 Document type mapped: "${inputName}" → "${mapped}"`);
    return mapped;
  }

  // Fallback: warn and return 'other'
  console.warn(`⚠️ Unknown document type: "${inputName}" → fallback to "other"`);
  return 'other';
}

/**
 * Validates if a document type is supported by the backend
 * @param documentType - Document type to validate
 * @returns True if supported, false otherwise
 */
export function isValidDocumentType(documentType: string): boolean {
  const canonical = mapToBackendDocumentType(documentType);
  return canonical !== 'other' || documentType === 'other';
}

/**
 * Gets all canonical document types supported by the backend
 * @returns Array of canonical document type strings
 */
export function getCanonicalDocumentTypes(): string[] {
  return [
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
}

export default mapToBackendDocumentType;