/**
 * Document Type Normalization System for Step 5 Upload Flow
 * Maps raw doc_requirements from lender products to canonical names
 * 
 * 🔒 LOCKED MAPPING SYSTEM
 * To prevent unauthorized edits that could break document uploads,
 * set VITE_ALLOW_MAPPING_EDITS=true in environment to allow modifications.
 */

// 🔒 Lock: Prevent unauthorized edits
// ❗ To allow edits, set `VITE_ALLOW_MAPPING_EDITS=true` in .env file
try {
  // Check if running in browser/Vite context
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (!import.meta.env.VITE_ALLOW_MAPPING_EDITS) {
      console.warn(
        "[LOCKED] mapToBackendDocumentType is currently locked. Set VITE_ALLOW_MAPPING_EDITS=true to modify."
      );
      // Optionally throw an error to prevent startup in production
      if (import.meta.env.MODE === 'production') {
        throw new Error("Mapping edit blocked: mapToBackendDocumentType is locked.");
      }
    }
  }
} catch (error) {
  // Running in Node.js context (validation scripts) - skip lock check
  console.log("🔧 [NODE.JS] Skipping browser-only lock check for validation script");
}

/**
 * CRITICAL: Central Document Type Mapping for Staff Backend Compatibility
 * Maps ALL client-side document types to the 22 official backend enum values
 * Based on SUPPORTED_DOCUMENT_TYPES from shared/documentTypes.ts
 */
export const DOCUMENT_TYPE_MAP: Record<string, string> = {
  // ============ UPDATED BACKEND TYPES (22 supported - updated Jan 27, 2025) ============
  'accounts_payable': 'accounts_payable',
  'accounts_receivable': 'accounts_receivable', 
  'articles_of_incorporation': 'articles_of_incorporation',
  'balance_sheet': 'balance_sheet',
  'bank_statements': 'bank_statements',
  'business_license': 'business_license',
  'business_plan': 'business_plan',
  'cash_flow_statement': 'cash_flow_statement',
  'collateral_docs': 'collateral_docs',
  'drivers_license_front_back': 'drivers_license_front_back',
  'equipment_quote': 'equipment_quote',
  'accountant_financials': 'accountant_financials',  // Updated from financial_statements
  'invoice_samples': 'invoice_samples',
  'other': 'other',
  'personal_financials': 'personal_financials',  // Updated from personal_financial_statement
  'personal_guarantee': 'personal_guarantee',
  'profit_and_loss': 'profit_and_loss',  // Updated from profit_loss_statement
  'proof_of_identity': 'proof_of_identity',
  'signed_application': 'signed_application',
  'supplier_agreement': 'supplier_agreement',
  'tax_returns': 'tax_returns',
  'void_cheque': 'void_cheque',  // Updated from void_pad
  
  // ============ CLIENT-SIDE MAPPINGS → BACKEND TYPES ============
  
  // Bank Statements variations
  'bank_statement': 'bank_statements',
  'banking_statements': 'bank_statements',
  'bank_account_statements': 'bank_statements',
  
  // Financial Statements variations → accountant_financials (updated)
  'account_prepared_financials': 'accountant_financials',
  'accountant_prepared_financials': 'accountant_financials', 
  'accountant_prepared_statements': 'accountant_financials',
  'accountant_prepared_financial_statements': 'accountant_financials',
  'audited_financial_statements': 'accountant_financials',
  'audited_financials': 'accountant_financials',
  'compiled_financial_statements': 'accountant_financials',
  'financial_statements': 'accountant_financials',
  
  // P&L Statement variations → profit_and_loss (updated)
  'pnl_statement': 'profit_and_loss',
  'p&l_statement': 'profit_and_loss',
  'income_statement': 'profit_and_loss',
  'profit_and_loss_statement': 'profit_and_loss',
  'profit_loss_statement': 'profit_and_loss',
  
  // Tax Returns variations
  'tax_return': 'tax_returns',
  'business_tax_returns': 'tax_returns',
  'corporate_tax_returns': 'tax_returns',
  
  // Void Check variations → void_cheque (updated)
  'void_cheque': 'void_cheque',
  'void_check': 'void_cheque',
  'voided_check': 'void_cheque',
  'cancelled_check': 'void_cheque',
  'banking_info': 'void_cheque',
  'bank_verification': 'void_cheque',
  'void_pad': 'void_cheque',
  
  // Personal Financial Statement variations → personal_financials (updated)
  'personal_financial_statement': 'personal_financials',
  'personal_financials': 'personal_financials',
  
  // Driver's License variations
  'driver_license': 'drivers_license_front_back',
  'drivers_license': 'drivers_license_front_back',
  'driving_license': 'drivers_license_front_back',
  'id_verification': 'drivers_license_front_back',
  'government_id': 'drivers_license_front_back',
  
  // Invoice variations → invoice_samples  
  'invoice_summary': 'invoice_samples',
  'invoices': 'invoice_samples',
  'sample_invoices': 'invoice_samples',
  'customer_invoices': 'invoice_samples',
  
  // Accounts Receivable variations
  'ar_report': 'accounts_receivable',
  'receivables': 'accounts_receivable',
  'ar_aging': 'accounts_receivable',
  'accounts_receivable_aging': 'accounts_receivable',
  
  // Accounts Payable variations
  'ap_report': 'accounts_payable',
  'payables': 'accounts_payable',
  'ap_aging': 'accounts_payable',
  'accounts_payable_aging': 'accounts_payable',
  
  // Equipment variations
  'equipment_invoice': 'equipment_quote',
  'equipment_specifications': 'equipment_quote',
  
  // Business License variations
  'operating_license': 'business_license',
  'professional_license': 'business_license',
  
  // Articles variations
  'incorporation_documents': 'articles_of_incorporation',
  'corporate_formation_documents': 'articles_of_incorporation',
  
  // Personal Financial Statement variations
  'personal_financial_statements': 'personal_financial_statement',
  'personal_balance_sheet': 'personal_financial_statement',
  
  // Collateral variations
  'collateral_documents': 'collateral_docs',
  'security_documents': 'collateral_docs',
  
  // Proof of Identity variations
  'identity_verification': 'proof_of_identity',
  'id_documents': 'proof_of_identity',
  
  // Supplier Agreement variations
  'supplier_contracts': 'supplier_agreement',
  'vendor_agreements': 'supplier_agreement',
  
  // Business Plan variations
  'business_plans': 'business_plan',
  'financial_projections': 'business_plan',
  
  // Personal Guarantee variations
  'personal_guarantees': 'personal_guarantee',
  'guarantee_documents': 'personal_guarantee',
  
  // Signed Application variations
  'completed_application': 'signed_application',
  'loan_application': 'signed_application',
};

/**
 * CRITICAL: Safe document type mapping with error handling
 * Ensures all client types are mapped to valid backend types
 */
export function mapToBackendDocumentType(clientDocType: string): string {
  if (!clientDocType || typeof clientDocType !== 'string') {
    throw new Error(`Invalid document type: ${clientDocType}`);
  }
  
  const normalizedInput = clientDocType.toLowerCase().trim();
  const backendType = DOCUMENT_TYPE_MAP[normalizedInput];
  
  if (!backendType) {
    console.error(`❌ [DOCUMENT-TYPE-ERROR] Unmapped document type: "${clientDocType}"`);
    console.error(`❌ Available mappings:`, Object.keys(DOCUMENT_TYPE_MAP));
    throw new Error(`Unmapped document type: ${clientDocType}. Please add mapping to DOCUMENT_TYPE_MAP.`);
  }
  
  console.log(`🔧 [DOCUMENT-TYPE-MAP] "${clientDocType}" → "${backendType}"`);
  return backendType;
}

/**
 * Validate if a document type is supported
 */
export function isValidDocumentType(docType: string): boolean {
  return docType in DOCUMENT_TYPE_MAP;
}

// Canonical document types (restricted set)
export const CANONICAL_DOCUMENT_TYPES = [
  'bank_statements',
  'financial_statements', 
  'tax_returns',
  'balance_sheet',
  'cash_flow_statement',
  'profit_loss_statement',
  'accounts_receivable',
  'accounts_payable',
  'personal_financial_statement',
  'business_plan',
  'equipment_quote',
  'sample_invoices',
  'supplier_agreement',
  'void_cheque',
  'driver_license',
  'business_license'
] as const;

export type CanonicalDocumentType = typeof CANONICAL_DOCUMENT_TYPES[number];

/**
 * Normalization mapping for doc_requirements from lender products
 * Maps various field names to canonical document types
 */
export const DOC_REQUIREMENTS_NORMALIZATION: Record<string, CanonicalDocumentType> = {
  // Direct matches
  'bank_statements': 'bank_statements',
  'financial_statements': 'financial_statements',
  'tax_returns': 'tax_returns',
  'balance_sheet': 'balance_sheet',
  'cash_flow_statement': 'cash_flow_statement',
  'profit_loss_statement': 'profit_loss_statement',
  'business_plan': 'business_plan',
  'equipment_quote': 'equipment_quote',
  'business_license': 'business_license',
  'personal_financial_statement': 'personal_financial_statement',
  
  // Accounts normalization
  'a/r_': 'accounts_receivable',
  'accounts_receivable': 'accounts_receivable', 
  'ar_aging': 'accounts_receivable',
  'receivables': 'accounts_receivable',
  
  'a/p_': 'accounts_payable',
  'accounts_payable': 'accounts_payable',
  'ap_aging': 'accounts_payable', 
  'payables': 'accounts_payable',
  
  // Banking documents
  'void_pad': 'void_cheque',
  'void_cheque': 'void_cheque',
  'voided_check': 'void_cheque',
  'banking_info': 'void_cheque',
  
  // Identity documents
  'drivers_license_front_back': 'driver_license',
  'driver_license': 'driver_license',
  'id_verification': 'driver_license',
  
  // Invoice samples
  'sample_invoices': 'sample_invoices',
  'invoice_samples': 'sample_invoices',
  'invoices': 'sample_invoices',
  
  // Supplier agreements
  'supplier_agreement': 'supplier_agreement',
  'supplier_contracts': 'supplier_agreement'
};

/**
 * Display labels for canonical document types
 */
export const CANONICAL_DOCUMENT_LABELS: Record<CanonicalDocumentType, string> = {
  'bank_statements': 'Bank Statements',
  'financial_statements': 'Financial Statements',
  'tax_returns': 'Tax Returns', 
  'balance_sheet': 'Balance Sheet',
  'cash_flow_statement': 'Cash Flow Statement',
  'profit_loss_statement': 'Profit & Loss Statement',
  'accounts_receivable': 'Accounts Receivable',
  'accounts_payable': 'Accounts Payable',
  'personal_financial_statement': 'Personal Financial Statement',
  'business_plan': 'Business Plan',
  'equipment_quote': 'Equipment Quote',
  'sample_invoices': 'Sample Invoices',
  'supplier_agreement': 'Supplier Agreement',
  'void_cheque': 'Void Cheque',
  'driver_license': 'Driver License',
  'business_license': 'Business License'
};

/**
 * Document descriptions for user guidance
 */
export const CANONICAL_DOCUMENT_DESCRIPTIONS: Record<CanonicalDocumentType, string> = {
  'bank_statements': 'Last 3-6 months of business bank statements',
  'financial_statements': 'Audited or compiled financial statements',
  'tax_returns': 'Business tax returns for previous 1-2 years',
  'balance_sheet': 'Current balance sheet showing assets and liabilities',
  'cash_flow_statement': 'Cash flow statement showing income and expenses',
  'profit_loss_statement': 'Profit and loss statement (P&L) for recent period',
  'accounts_receivable': 'Accounts receivable aging report',
  'accounts_payable': 'Accounts payable aging report', 
  'personal_financial_statement': 'Personal financial statement of business owner',
  'business_plan': 'Business plan with projections and market analysis',
  'equipment_quote': 'Quote or invoice for equipment being financed',
  'sample_invoices': 'Sample customer invoices showing payment terms',
  'supplier_agreement': 'Agreements with key suppliers or vendors',
  'void_cheque': 'Void cheque or banking information for payments',
  'driver_license': 'Driver license or government ID (front and back)',
  'business_license': 'Business license or registration documents'
};

/**
 * Normalize a document requirement string to canonical type
 */
export function normalizeDocRequirement(docReq: string): CanonicalDocumentType | null {
  if (!docReq || typeof docReq !== 'string') return null;
  
  const normalized = docReq.toLowerCase().trim();
  
  // Direct lookup
  if (DOC_REQUIREMENTS_NORMALIZATION[normalized]) {
    return DOC_REQUIREMENTS_NORMALIZATION[normalized];
  }
  
  // Partial matching for complex requirements
  for (const [pattern, canonical] of Object.entries(DOC_REQUIREMENTS_NORMALIZATION)) {
    if (normalized.includes(pattern.toLowerCase()) || pattern.toLowerCase().includes(normalized)) {
      return canonical;
    }
  }
  
  return null;
}

/**
 * Extract and normalize document requirements from lender products
 */
export function extractDocRequirements(lenderProducts: any[]): CanonicalDocumentType[] {
  const normalizedDocs = new Set<CanonicalDocumentType>();
  
  for (const product of lenderProducts) {
    // Handle multiple field name variations for doc requirements
    const docRequirements = 
      product.doc_requirements ||
      product.documentRequirements ||
      product.requiredDocuments ||
      product.required_documents ||
      [];
    
    if (Array.isArray(docRequirements)) {
      for (const docReq of docRequirements) {
        const normalized = normalizeDocRequirement(docReq);
        if (normalized) {
          normalizedDocs.add(normalized);
        }
      }
    } else if (typeof docRequirements === 'string') {
      // Handle comma-separated string format
      const docArray = docRequirements.split(',').map(s => s.trim());
      for (const docReq of docArray) {
        const normalized = normalizeDocRequirement(docReq);
        if (normalized) {
          normalizedDocs.add(normalized);
        }
      }
    }
  }
  
  return Array.from(normalizedDocs).sort();
}

/**
 * Get display information for canonical document type
 */
export function getCanonicalDocumentInfo(docType: CanonicalDocumentType) {
  return {
    type: docType,
    label: CANONICAL_DOCUMENT_LABELS[docType],
    description: CANONICAL_DOCUMENT_DESCRIPTIONS[docType],
    quantity: 1 // Default quantity, can be enhanced later
  };
}