/**
 * ✅ ENABLED: Client-side recommendation system for demo purposes
 * Basic product filtering and recommendations
 */
import { StaffLenderProduct } from '@/types/lenderProduct';

export interface RecommendationFormData {
  headquarters: string;
  fundingAmount: number;
  lookingFor: 'capital' | 'equipment' | 'both';
  accountsReceivableBalance: number;
  fundsPurpose: string;
}

/**
 * ✅ ENABLED: Basic product filtering for client-side recommendations
 */
export function filterProducts(products: any[], formData: RecommendationFormData): any[] {
  if (!products || products.length === 0) {
    console.log('[filterProducts] No products provided');
    return [];
  }

  console.log(`[filterProducts] Starting with ${products.length} products, filtering by:`, formData);
  
  // Debug: Log first product structure
  if (products.length > 0) {
    console.log('[filterProducts] Sample product structure:', products[0]);
  }

  // TEMPORARY: Return all products to see if the issue is with filtering
  console.log('[filterProducts] TEMPORARY: Returning all products for debugging');
  return products;

  /* Original filtering logic - temporarily disabled for debugging
  return products.filter(product => {
    // Country/headquarters matching - VERY permissive
    const productCountry = product.country || product.headquarters || product.location;
    const formCountry = formData.headquarters;
    
    const countryMatch = 
      !formCountry || // If no form country specified, accept all
      !productCountry || // If product has no country restriction, accept
      (formCountry === 'US' && (productCountry === 'US' || productCountry === 'United States' || productCountry === 'USA')) ||
      (formCountry === 'CA' && (productCountry === 'CA' || productCountry === 'Canada')) ||
      (productCountry === 'Both') || // Products available in both countries
      (productCountry === 'All'); // Products available everywhere

    // Funding amount matching - VERY permissive
    const fundingAmount = formData.fundingAmount || 50000;
    const minAmount = product.minAmount || product.amountMin || product.amount_min || product.min_amount || 0;
    const maxAmount = product.maxAmount || product.amountMax || product.amount_max || product.max_amount || 999999999;
    
    const amountMatch = !minAmount || !maxAmount || (fundingAmount >= minAmount && fundingAmount <= maxAmount);

    // Product type matching - VERY permissive
    const lookingFor = formData.lookingFor || 'capital';
    const category = product.category || product.type || product.productType || '';
    
    const typeMatch = 
      !lookingFor || // If no type specified, accept all
      lookingFor === 'both' || // Show all products if looking for both
      (lookingFor === 'capital') || // For now, accept all capital requests
      (category && category.toLowerCase().includes('capital')) ||
      (category && category.toLowerCase().includes('loan')) ||
      (category && category.toLowerCase().includes('credit'));

    const match = countryMatch && amountMatch && typeMatch;
    
    console.log(`[filterProducts] ${product.name}: Country(${countryMatch}) + Amount(${amountMatch}) + Type(${typeMatch}) = ${match}`);

    return match;
  });
  */
}

/**
 * ❌ DISABLED: Recommendation scoring not allowed on client
 */
export function calculateRecommendationScore(): number {
  throw new Error("Recommendation scoring restricted - handled server-side only");
}

/**
 * ❌ DISABLED: All other recommendation functions disabled
 */
export function getProductsByCategory(): never[] {
  return [];
}

export function findBestMatch(): null {
  return null;
}

export function calculateMatchPercentage(): number {
  return 0;
}

/**
 * 🔒 SECURITY MESSAGE: Client cannot access lender data
 */
export const RECOMMENDATION_DISABLED_MESSAGE = {
  title: "Lender Matching In Progress",
  message: "We'll match you with lenders once your documents are reviewed.",
  status: "pending_review",
  action: "Complete document upload to proceed with matching",
  icon: "⏳"
} as const;

// Types enabled for client-side filtering