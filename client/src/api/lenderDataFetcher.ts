/**
 * Comprehensive lender data fetcher with IndexedDB cache-only enforcement
 * Ensures products are only retrieved from local cache
 */

import { LenderProduct, LenderProductSchema } from '../../../shared/lenderProductSchema';

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
  try {
    return {
      id: rawProduct.id,
      name: rawProduct.product_name || rawProduct.name,
      lenderName: rawProduct.lender_name || rawProduct.lenderName,
      geography: Array.isArray(rawProduct.geography) ? rawProduct.geography : [rawProduct.country || 'US'],
      country: rawProduct.country || 'US',
      category: rawProduct.category || rawProduct.product_type || 'term_loan',
      minAmount: rawProduct.min_amount || rawProduct.amountMin || 0,
      maxAmount: rawProduct.max_amount || rawProduct.amountMax || 0,
      minRevenue: rawProduct.min_revenue || rawProduct.requirements?.minMonthlyRevenue || 0,
      interestRateMin: rawProduct.interest_rate_min,
      interestRateMax: rawProduct.interest_rate_max,
      termMin: rawProduct.term_min,
      termMax: rawProduct.term_max,
      docRequirements: rawProduct.doc_requirements || getDocRequirementsForCategory(rawProduct.category),
      description: rawProduct.description || '',
      industries: rawProduct.industries || rawProduct.requirements?.industries || ['general']
    };
  } catch (error) {
    throw error;
  }
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
    
    if (cached?.length) {
      return {
        success: true,
        products: cached,
        count: cached.length,
        source: 'staff_api',
        timestamp: lastFetched ? new Date(lastFetched).toISOString() : new Date().toISOString()
      };
    }
    
    return {
      success: false,
      products: [],
      count: 0,
      source: 'cache_empty',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      products: [],
      count: 0,
      source: 'cache_error',
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
  return Math.max(...response.products.map(p => p.maxAmount));
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
  return [...new Set(response.products.map(p => p.country))];
}