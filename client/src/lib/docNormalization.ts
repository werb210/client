/**
 * Document Type Normalization System for Step 5 Upload Flow
 * Maps raw doc_requirements from lender products to canonical names
 */

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