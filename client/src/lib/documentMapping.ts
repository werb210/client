/**
 * Unified document type mapping system
 * Maps user-friendly display names to API-safe document type codes
 */

/**
 * Complete mapping of display names to API document types
 * This is the single source of truth for document type conversion
 */
export const DOCUMENT_TYPE_MAP: Record<string, string> = {
  // Financial Documents
  "Bank Statements": "bank_statements",
  "Financial Statements": "financial_statements", 
  "Accountant Prepared Financial Statements": "financial_statements", // Maps to same API type
  "Personal Financial Statement": "personal_financial_statement",
  "Profit & Loss Statement": "profit_loss_statement",
  "P&L Statement": "profit_loss_statement",
  "Balance Sheet": "balance_sheet",
  "Cash Flow Statement": "cash_flow_statement",
  
  // Business Documents  
  "Business License": "business_license",
  "Articles of Incorporation": "articles_of_incorporation",
  "Business Plan": "business_plan",
  "Tax Returns": "tax_returns",
  "Signed Application": "signed_application",
  
  // Personal Documents
  "Driver's License (Front & Back)": "drivers_license_front_back",
  "Proof of Identity": "proof_of_identity",
  "Personal Guarantee": "personal_guarantee",
  
  // Accounts Documents
  "Accounts Receivable": "accounts_receivable",
  "Accounts Payable": "accounts_payable",
  "A/R Aging Report": "accounts_receivable",
  "A/P Aging Report": "accounts_payable",
  
  // Equipment & Collateral
  "Equipment Quote": "equipment_quote",
  "Collateral Documentation": "collateral_docs",
  "Invoice Samples": "invoice_samples",
  "Supplier Agreement": "supplier_agreement",
  
  // Banking
  "VOID/PAD Cheque": "void_pad",
  "Voided Check": "void_pad",
  
  // Fallback
  "Other": "other"
};

/**
 * Reverse mapping from API codes to display names
 */
export const API_TO_DISPLAY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(DOCUMENT_TYPE_MAP).map(([display, api]) => [api, display])
);

/**
 * Convert display name to API-safe document type code
 */
export function getApiCategory(displayName: string): string {
  // Direct lookup first
  if (DOCUMENT_TYPE_MAP[displayName]) {
    return DOCUMENT_TYPE_MAP[displayName];
  }
  
  // Fuzzy matching for variations
  const normalizedInput = displayName.toLowerCase().trim();
  
  for (const [display, api] of Object.entries(DOCUMENT_TYPE_MAP)) {
    if (display.toLowerCase() === normalizedInput) {
      return api;
    }
  }
  
  // Last resort: normalize the display name
  return displayName
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_')    // Replace spaces with underscores
    .trim();
}

/**
 * Convert API code back to user-friendly display name
 */
export function getDisplayName(apiCode: string): string {
  return API_TO_DISPLAY_MAP[apiCode] || 
         apiCode.replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get all supported document types for validation
 */
export function getSupportedDocumentTypes(): string[] {
  return Object.keys(DOCUMENT_TYPE_MAP);
}

/**
 * Get all API document codes
 */
export function getSupportedApiCodes(): string[] {
  return Array.from(new Set(Object.values(DOCUMENT_TYPE_MAP)));
}

/**
 * Normalize document name for consistent processing
 */
export function normalizeDocumentName(name: string): string {
  return name
    .trim()
    .replace(/[^\w\s&]/g, '') // Keep alphanumeric, spaces, and &
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .replace(/\b\w/g, l => l.toUpperCase()); // Title case
}

/**
 * Check if document type is valid for API submission
 */
export function isValidDocumentType(displayName: string): boolean {
  return getSupportedDocumentTypes().includes(displayName) ||
         getSupportedApiCodes().includes(displayName);
}

/**
 * Document category groupings for UI organization
 */
export const DOCUMENT_CATEGORIES = {
  financial: [
    "Bank Statements",
    "Financial Statements", 
    "Accountant Prepared Financial Statements",
    "Personal Financial Statement",
    "Profit & Loss Statement",
    "Balance Sheet", 
    "Cash Flow Statement"
  ],
  business: [
    "Business License",
    "Articles of Incorporation", 
    "Business Plan",
    "Tax Returns",
    "Signed Application"
  ],
  personal: [
    "Driver's License (Front & Back)",
    "Proof of Identity",
    "Personal Guarantee"
  ],
  accounts: [
    "Accounts Receivable",
    "Accounts Payable", 
    "A/R Aging Report",
    "A/P Aging Report"
  ],
  equipment: [
    "Equipment Quote",
    "Collateral Documentation",
    "Invoice Samples",
    "Supplier Agreement"
  ],
  banking: [
    "VOID/PAD Cheque",
    "Voided Check"
  ]
};

/**
 * Get document category for a given document type
 */
export function getDocumentCategory(displayName: string): string {
  for (const [category, documents] of Object.entries(DOCUMENT_CATEGORIES)) {
    if (documents.includes(displayName)) {
      return category;
    }
  }
  return 'other';
}