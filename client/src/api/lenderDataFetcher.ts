/**
 * Comprehensive lender data fetcher with IndexedDB cache-only enforcement
 * Ensures products are only retrieved from local cache
 */

import type { LenderProduct } from '../types/lenderProduct';

interface LenderDataResponse {
  success: boolean;
  products: LenderProduct[];
  count: number;
  source: 'staff_api' | 'fallback';
  timestamp: string;
}

/**
 * Normalize raw product data to match our schema
 */
function normalizeProductData(rawProduct: any): LenderProduct {
  const requiredDocuments = Array.isArray(rawProduct.required_documents)
    ? rawProduct.required_documents
    : Array.isArray(rawProduct.doc_requirements)
      ? rawProduct.doc_requirements
      : undefined;

  const minAmount = Number(rawProduct.min_amount ?? rawProduct.amountMin ?? 0);
  const maxAmount = Number(rawProduct.max_amount ?? rawProduct.amountMax ?? 0);

  return {
    id: String(rawProduct.id ?? ''),
    name: String(rawProduct.name ?? rawProduct.product_name ?? 'Unknown Product'),
    lender_name: String(rawProduct.lender_name ?? rawProduct.lenderName ?? 'Unknown Lender'),
    country: (rawProduct.country ?? rawProduct.countryOffered ?? null) as LenderProduct['country'],
    category: String(rawProduct.category ?? rawProduct.product_type ?? 'term_loan'),
    min_amount: Number.isFinite(minAmount) ? minAmount : 0,
    max_amount: Number.isFinite(maxAmount) ? maxAmount : 0,
    active: Boolean(rawProduct.active ?? true),
    updated_at: String(rawProduct.updated_at ?? new Date().toISOString()),
    min_time_in_business: rawProduct.min_time_in_business ?? null,
    min_monthly_revenue: rawProduct.min_monthly_revenue ?? rawProduct.requirements?.minMonthlyRevenue ?? null,
    excluded_industries: Array.isArray(rawProduct.excluded_industries)
      ? rawProduct.excluded_industries
      : undefined,
    required_documents: requiredDocuments,
    product_name: rawProduct.product_name ?? rawProduct.name,
    lender_id: rawProduct.lender_id,
    tenant_id: rawProduct.tenant_id,
    interest_rate_min: rawProduct.interest_rate_min ?? null,
    interest_rate_max: rawProduct.interest_rate_max ?? null,
    term_min: rawProduct.term_min ?? null,
    term_max: rawProduct.term_max ?? null,
    custom_requirements: rawProduct.custom_requirements,
    variant_sig: rawProduct.variant_sig,
  };
}

/**
 * Get document requirements for a product category
 */
function getDocRequirementsForCategory(category: string): string[] {
  const requirements: Record<string, string[]> = {
    'equipment_financing': ['Equipment Quote', 'Bank Statements', 'Business Tax Returns'],
    'line_of_credit': ['Bank Statements', 'Financial Statements', 'Business Tax Returns'],
    'working_capital': ['Bank Statements', 'Financial Statements', 'Cash Flow Statement'],
    'term_loan': ['Bank Statements', 'Business Tax Returns', 'Financial Statements'],
    'invoice_factoring': ['Accounts Receivable Aging', 'Bank Statements', 'Customer List'],
    'purchase_order_financing': ['Purchase Orders', 'Bank Statements', 'Customer Credit Check'],
    'asset_based_lending': ['Asset Valuation', 'Bank Statements', 'Financial Statements'],
    'sba_loan': ['SBA Forms', 'Bank Statements', 'Business Tax Returns', 'Personal Tax Returns']
  };
  
  return requirements[category] || ['Bank Statements', 'Business Tax Returns'];
}

/**
 * Fetch lender products from IndexedDB cache only (strict caching enforcement)
 */
export async function fetchLenderProducts(): Promise<LenderDataResponse> {
  const { loadLenderProducts, loadCacheSource, loadLastFetchTime } = await import('../utils/lenderCache');
  
  try {
    const cached = await loadLenderProducts();
    const source = await loadCacheSource();
    const lastFetched = await loadLastFetchTime();
    
    if (Array.isArray(cached) && cached.length) {
      const products = cached.map(normalizeProductData);
      return {
        success: true,
        products,
        count: products.length,
        source: 'staff_api',
        timestamp: lastFetched ? new Date(lastFetched).toISOString() : new Date().toISOString()
      };
    }

    return {
      success: false,
      products: [],
      count: 0,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      products: [],
      count: 0,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * DISABLED: Scheduled cache refresh function (replaced by manual cache setup)
 * Cache must be populated manually via /cache-setup page
 */
export async function scheduledCacheRefresh(): Promise<void> {
  // Disabled in production cache-only mode
  return;
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<LenderProduct[]> {
  const response = await fetchLenderProducts();
  return response.products.filter(product => product.category === category);
}

/**
 * Get products by country
 */
export async function getProductsByCountry(country: string): Promise<LenderProduct[]> {
  const response = await fetchLenderProducts();
  return response.products.filter(product => product.country === country);
}

/**
 * Get maximum funding amount available
 */
export async function getMaximumFunding(): Promise<number> {
  const response = await fetchLenderProducts();
  return Math.max(...response.products.map(p => p.max_amount ?? 0));
}

/**
 * Get all available categories
 */
export async function getAvailableCategories(): Promise<string[]> {
  const response = await fetchLenderProducts();
  return [...new Set(response.products.map(p => p.category))];
}

/**
 * Get all available countries
 */
export async function getAvailableCountries(): Promise<string[]> {
  const response = await fetchLenderProducts();
  return [...new Set(response.products.map(p => p.country).filter((country): country is string => typeof country === 'string' && country.length > 0))];
}