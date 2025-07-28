/**
 * Unified field access utilities for lender products
 * Handles all naming variations and provides consistent API
 */

export interface ProductAmountRange {
  min: number;
  max: number;
}

export interface LenderProduct {
  [key: string]: any;
}

/**
 * Gets amount range from product with fallback handling
 */
export function getAmountRange(product: LenderProduct): ProductAmountRange {
  return {
    min: product.amount_min ?? 
         product.amountMin ?? 
         product.fundingMin ?? 
         product.minAmount ?? 
         product.min_amount ?? 
         0,
    max: product.amount_max ?? 
         product.amountMax ?? 
         product.fundingMax ?? 
         product.maxAmount ?? 
         product.max_amount ?? 
         Infinity,
  };
}

/**
 * Gets geography/country information with array support
 */
export function getGeography(product: LenderProduct): string[] {
  // Handle geography arrays first
  if (product.geography && Array.isArray(product.geography) && product.geography.length > 0) {
    return product.geography;
  }
  
  // Handle single country field
  const country = product.country ?? product.geography ?? "CA";
  return Array.isArray(country) ? country : [country];
}

/**
 * Gets required documents with all field name variations
 */
export function getRequiredDocuments(product: LenderProduct): string[] {
  const documents = product.required_documents ??
                   product.requiredDocuments ??
                   product.documentRequirements ??
                   product.doc_requirements ??
                   product.document_requirements ??
                   [];
  
  return Array.isArray(documents) ? documents : [];
}

/**
 * Gets lender name with fallback handling
 */
export function getLenderName(product: LenderProduct): string {
  return product.lender_name ?? 
         product.lenderName ?? 
         product.lender ?? 
         "Unknown Lender";
}

/**
 * Gets minimum revenue requirement with fallback handling
 */
export function getRevenueMin(product: LenderProduct): number {
  return product.revenue_min ?? 
         product.revenueMin ?? 
         product.minimumRevenue ?? 
         product.min_revenue ?? 
         0;
}

/**
 * Gets product name with fallback handling
 */
export function getProductName(product: LenderProduct): string {
  return product.name ?? 
         product.product_name ?? 
         product.productName ?? 
         "Unknown Product";
}

/**
 * Gets product category with normalization
 */
export function getProductCategory(product: LenderProduct): string {
  return product.category ?? 
         product.product_category ?? 
         product.productCategory ?? 
         "";
}

/**
 * Category matching map for fuzzy matching
 */
export const CATEGORY_MAP: Record<string, string[]> = {
  equipment: [
    "Equipment Financing", 
    "equipment_financing", 
    "equipment", 
    "Equipment Loan",
    "Equipment Purchase"
  ],
  working_capital: [
    "Working Capital", 
    "Working Capital Loan",
    "Working Capital Financing",
    "Term Loan", 
    "Loan",
    "Business Loan",
    "working_capital",
    "term_loan"
  ],
  factoring: [
    "Invoice Factoring", 
    "AR Factoring", 
    "Factor+",
    "Factoring",
    "invoice_factoring",
    "accounts_receivable_factoring"
  ],
  "line of credit": [
    "Line of Credit",
    "Business Line of Credit", 
    "LOC",
    "Credit Line",
    "line_of_credit",
    "business_line_of_credit"
  ],
  purchase_order: [
    "Purchase Order Financing",
    "PO Financing",
    "purchase_order",
    "po_financing"
  ],
  asset_based: [
    "Asset Based Lending",
    "ABL",
    "Asset Based",
    "asset_based_lending"
  ],
  sba: [
    "SBA Loan",
    "SBA Financing", 
    "Small Business Administration",
    "sba_loan"
  ]
};

/**
 * Fuzzy matching for product categories
 */
export function matchesCategory(userSelection: string, productCategory: string): boolean {
  if (!productCategory) return false;
  
  // Direct match first
  if (productCategory.toLowerCase().includes(userSelection.toLowerCase())) {
    return true;
  }
  
  // Fuzzy matching with aliases
  const aliases = CATEGORY_MAP[userSelection.toLowerCase()] || [];
  return aliases.some(alias => 
    productCategory.toLowerCase().includes(alias.toLowerCase())
  );
}

/**
 * Check if product has required amount fields
 */
export function hasAmountFields(product: LenderProduct): boolean {
  return !!(
    product.amount_min || 
    product.amountMin || 
    product.fundingMin || 
    product.minAmount || 
    product.min_amount ||
    product.amount_max || 
    product.amountMax || 
    product.fundingMax || 
    product.maxAmount || 
    product.max_amount
  );
}

/**
 * Check if product has document requirements
 */
export function hasDocumentFields(product: LenderProduct): boolean {
  const docs = getRequiredDocuments(product);
  return docs.length > 0;
}

/**
 * Normalize country codes for consistent matching
 */
export function normalizeCountryCode(country: string): string {
  const normalized = country.toUpperCase();
  
  // Handle common variations
  const countryMap: Record<string, string> = {
    'CANADA': 'CA',
    'UNITED STATES': 'US',
    'USA': 'US',
    'BOTH': 'BOTH',
    'US/CA': 'BOTH',
    'CA/US': 'BOTH'
  };
  
  return countryMap[normalized] || normalized;
}