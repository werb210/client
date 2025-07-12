/**
 * Comprehensive lender data fetcher with staff API and fallback support
 * Ensures products are always available for the application
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
  return {
    id: rawProduct.id,
    name: rawProduct.name,
    lenderName: rawProduct.lenderName,
    geography: Array.isArray(rawProduct.geography) ? rawProduct.geography : [rawProduct.country || 'US'],
    country: rawProduct.country || 'US',
    category: rawProduct.category,
    minAmount: typeof rawProduct.amountMin === 'number' ? rawProduct.amountMin : rawProduct.minAmountUsd || 0,
    maxAmount: typeof rawProduct.amountMax === 'number' ? rawProduct.amountMax : rawProduct.maxAmountUsd || 0,
    minRevenue: rawProduct.requirements?.minMonthlyRevenue || 0,
    interestRateMin: undefined,
    interestRateMax: undefined,
    termMin: undefined,
    termMax: undefined,
    docRequirements: getDocRequirementsForCategory(rawProduct.category),
    description: rawProduct.description,
    industries: rawProduct.requirements?.industries || rawProduct.industries
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
 * Fetch lender products from staff API with fallback
 */
export async function fetchLenderProducts(): Promise<LenderDataResponse> {
  console.log('[DEBUG] lenderDataFetcher - Starting fetch process');
  console.log('[LENDER_FETCHER] Starting lender product fetch...');
  
  // Try staff API first
  const staffApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (staffApiUrl) {
    try {
      console.log(`[LENDER_FETCHER] Attempting staff API: ${staffApiUrl}/public/lenders`);
      console.log('[DEBUG] Environment API URL:', staffApiUrl);
      
      console.log('[DEBUG] About to make fetch request...');
      const response = await fetch(`${staffApiUrl}/public/lenders`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[DEBUG] Fetch completed successfully');
      console.log('[DEBUG] Fetch response status:', response.status);
      console.log('[DEBUG] Fetch response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('[LENDER_FETCHER] Staff API response received');
        
        const products = (data.products || data.data || data).map(normalizeProductData);
        
        console.log(`[LENDER_FETCHER] ✅ Staff API success: ${products.length} products`);
        return {
          success: true,
          products,
          count: products.length,
          source: 'staff_api',
          timestamp: new Date().toISOString()
        };
      } else {
        console.warn(`[LENDER_FETCHER] Staff API failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('[DEBUG] Fetch failed - error type:', typeof error);
      console.error('[DEBUG] Fetch failed - error message:', error instanceof Error ? error.message : 'Unknown');
      console.error('[DEBUG] Fetch failed - full error:', error);
      console.warn('[LENDER_FETCHER] Staff API error:', error);
    }
  }

  // Fall back to local data
  console.log('[LENDER_FETCHER] Using fallback data...');
  try {
    const fallbackResponse = await fetch('/fallback/lenders.json');
    if (!fallbackResponse.ok) {
      throw new Error(`Fallback fetch failed: ${fallbackResponse.status}`);
    }
    
    const fallbackData = await fallbackResponse.json();
    const products = fallbackData.products.map(normalizeProductData);
    
    console.log(`[LENDER_FETCHER] ✅ Fallback success: ${products.length} products`);
    return {
      success: true,
      products,
      count: products.length,
      source: 'fallback',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[LENDER_FETCHER] Fallback failed:', error);
    throw new Error('Both staff API and fallback data unavailable');
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<LenderProduct[]> {
  const { products } = await fetchLenderProducts();
  return products.filter(product => product.category === category);
}

/**
 * Get products by country
 */
export async function getProductsByCountry(country: string): Promise<LenderProduct[]> {
  const { products } = await fetchLenderProducts();
  return products.filter(product => 
    product.geography.includes(country.toUpperCase()) || 
    product.country?.toUpperCase() === country.toUpperCase()
  );
}

/**
 * Get maximum funding amount available
 */
export async function getMaximumFunding(): Promise<number> {
  const { products } = await fetchLenderProducts();
  return Math.max(...products.map(p => p.maxAmount));
}

/**
 * Get all available categories
 */
export async function getAvailableCategories(): Promise<string[]> {
  const { products } = await fetchLenderProducts();
  return [...new Set(products.map(p => p.category))];
}

/**
 * Get all available countries
 */
export async function getAvailableCountries(): Promise<string[]> {
  const { products } = await fetchLenderProducts();
  const countries = new Set<string>();
  products.forEach(p => {
    if (p.country) countries.add(p.country);
    p.geography.forEach(geo => countries.add(geo));
  });
  return Array.from(countries);
}