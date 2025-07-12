/**
 * Required Documents Validator
 * Ensures products have properly populated requiredDocuments fields
 * Critical for Step 5 document upload functionality
 */

export interface ProductValidationResult {
  productId: string;
  productName: string;
  hasRequiredDocuments: boolean;
  requiredDocumentsCount: number;
  missingFields: string[];
  severity: 'critical' | 'warning' | 'info';
}

export interface ValidationSummary {
  totalProducts: number;
  productsWithDocuments: number;
  productsWithoutDocuments: number;
  criticalIssues: ProductValidationResult[];
  recommendations: string[];
}

/**
 * Default required documents by product category
 * Used as fallback when requiredDocuments field is missing
 */
export const DEFAULT_REQUIRED_DOCUMENTS_BY_CATEGORY: Record<string, string[]> = {
  'Term Loan': ['bank_statements', 'tax_returns', 'financial_statements'],
  'Business Line of Credit': ['bank_statements', 'tax_returns', 'financial_statements'],
  'Equipment Financing': ['bank_statements', 'tax_returns', 'equipment_quote'],
  'Invoice Factoring': ['bank_statements', 'accounts_receivable_aging', 'sample_invoices'],
  'Working Capital': ['bank_statements', 'tax_returns', 'cash_flow_statement'],
  'Purchase Order Financing': ['bank_statements', 'purchase_orders', 'supplier_contracts'],
  'Asset-Based Lending': ['bank_statements', 'tax_returns', 'asset_appraisal', 'financial_statements'],
  'SBA Loan': ['bank_statements', 'tax_returns', 'financial_statements', 'business_plan']
};

/**
 * Validates a single product for required documents
 */
export function validateProductRequiredDocuments(product: any): ProductValidationResult {
  const missingFields: string[] = [];
  let severity: 'critical' | 'warning' | 'info' = 'info';

  // Check if requiredDocuments field exists and is populated
  const hasRequiredDocuments = product.requiredDocuments && 
                               Array.isArray(product.requiredDocuments) && 
                               product.requiredDocuments.length > 0;

  if (!hasRequiredDocuments) {
    missingFields.push('requiredDocuments');
    severity = 'critical';
  }

  // Check if documentRequirements field exists (alternative field name)
  if (!product.documentRequirements && !hasRequiredDocuments) {
    missingFields.push('documentRequirements');
  }

  const requiredDocumentsCount = hasRequiredDocuments ? product.requiredDocuments.length : 0;

  return {
    productId: product.id || 'unknown',
    productName: product.name || 'Unknown Product',
    hasRequiredDocuments,
    requiredDocumentsCount,
    missingFields,
    severity
  };
}

/**
 * Validates all products for required documents field
 */
export function validateAllProductsRequiredDocuments(products: any[]): ValidationSummary {
  const validationResults = products.map(validateProductRequiredDocuments);
  
  const productsWithDocuments = validationResults.filter(r => r.hasRequiredDocuments).length;
  const productsWithoutDocuments = validationResults.filter(r => !r.hasRequiredDocuments).length;
  const criticalIssues = validationResults.filter(r => r.severity === 'critical');

  const recommendations: string[] = [];
  
  if (productsWithoutDocuments > 0) {
    recommendations.push(`${productsWithoutDocuments} products are missing requiredDocuments field`);
    recommendations.push('Step 5 document upload will not work for these products');
    recommendations.push('Update staff backend to populate requiredDocuments for all products');
  }

  if (criticalIssues.length > 0) {
    recommendations.push('CRITICAL: Document upload workflow will break for products without requiredDocuments');
    recommendations.push('Consider implementing fallback documents based on product category');
  }

  return {
    totalProducts: products.length,
    productsWithDocuments,
    productsWithoutDocuments,
    criticalIssues,
    recommendations
  };
}

/**
 * Provides fallback required documents based on product category
 */
export function getFallbackRequiredDocuments(product: any): string[] {
  const category = product.category || product.productCategory || 'Unknown';
  
  // Try exact match first
  if (DEFAULT_REQUIRED_DOCUMENTS_BY_CATEGORY[category]) {
    return DEFAULT_REQUIRED_DOCUMENTS_BY_CATEGORY[category];
  }

  // Try partial match for common terms
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('equipment')) {
    return DEFAULT_REQUIRED_DOCUMENTS_BY_CATEGORY['Equipment Financing'];
  }
  
  if (categoryLower.includes('factoring') || categoryLower.includes('invoice')) {
    return DEFAULT_REQUIRED_DOCUMENTS_BY_CATEGORY['Invoice Factoring'];
  }
  
  if (categoryLower.includes('line of credit') || categoryLower.includes('loc')) {
    return DEFAULT_REQUIRED_DOCUMENTS_BY_CATEGORY['Business Line of Credit'];
  }
  
  if (categoryLower.includes('term loan') || categoryLower.includes('loan')) {
    return DEFAULT_REQUIRED_DOCUMENTS_BY_CATEGORY['Term Loan'];
  }
  
  if (categoryLower.includes('working capital')) {
    return DEFAULT_REQUIRED_DOCUMENTS_BY_CATEGORY['Working Capital'];
  }
  
  if (categoryLower.includes('purchase order') || categoryLower.includes('po')) {
    return DEFAULT_REQUIRED_DOCUMENTS_BY_CATEGORY['Purchase Order Financing'];
  }
  
  if (categoryLower.includes('asset') || categoryLower.includes('abl')) {
    return DEFAULT_REQUIRED_DOCUMENTS_BY_CATEGORY['Asset-Based Lending'];
  }
  
  if (categoryLower.includes('sba')) {
    return DEFAULT_REQUIRED_DOCUMENTS_BY_CATEGORY['SBA Loan'];
  }

  // Default fallback for unknown categories
  return ['bank_statements', 'tax_returns', 'financial_statements'];
}

/**
 * Enhanced product with guaranteed requiredDocuments field
 */
export function ensureRequiredDocuments(product: any): any {
  if (product.requiredDocuments && Array.isArray(product.requiredDocuments) && product.requiredDocuments.length > 0) {
    return product; // Already has valid requiredDocuments
  }

  // Add fallback requiredDocuments based on category
  const fallbackDocuments = getFallbackRequiredDocuments(product);
  
  return {
    ...product,
    requiredDocuments: fallbackDocuments,
    _hasOriginalRequiredDocuments: false,
    _fallbackSource: 'category-based'
  };
}