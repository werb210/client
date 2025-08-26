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
export function filterProducts(products: any[], formData: Partial<RecommendationFormData>): any[] {
  if (!products || products.length === 0) {
    console.log('[filterProducts] No products provided');
    return [];
  }

  // Provide safe defaults for all required fields
  const safeFormData = {
    headquarters: formData.headquarters || 'CA',
    fundingAmount: formData.fundingAmount || 50000,
    lookingFor: (formData.lookingFor || 'capital') as 'capital' | 'equipment' | 'both',
    accountsReceivableBalance: formData.accountsReceivableBalance || 0,
    fundsPurpose: formData.fundsPurpose || 'working_capital'
  };

  console.log(`[filterProducts] Starting with ${products.length} products, filtering by:`, safeFormData);
  
  // Debug: Log first product structure
  if (products.length > 0) {
    console.log('[filterProducts] Sample product structure:', products[0]);
  }

  // FIXED: Use correct field names for filtering
  return products.filter(product => {
    // Active status filtering - be more lenient for testing
    const isActive = product.active !== false;
    
    // Country/headquarters matching with correct field name
    const productCountry = product.country;
    const formCountry = safeFormData.headquarters;
    
    const countryMatch = 
      !formCountry || // If no form country specified, accept all
      !productCountry || // If product has no country restriction, accept
      (formCountry === 'US' && (productCountry === 'US' || productCountry === 'United States' || productCountry === 'USA')) ||
      (formCountry === 'CA' && (productCountry === 'CA' || productCountry === 'Canada')) ||
      (productCountry === 'Both') || // Products available in both countries
      (productCountry === 'All') || // Products available everywhere
      true; // For testing: accept all products when direct navigation

    // Funding amount matching with correct field names
    const fundingAmount = safeFormData.fundingAmount;
    const minAmount = product.min_amount || 0;
    const maxAmount = product.max_amount || 999999999;
    
    const amountMatch = fundingAmount >= minAmount && fundingAmount <= maxAmount;

    // Product type matching with correct field name
    const lookingFor = safeFormData.lookingFor;
    const category = product.category || '';
    
    const typeMatch = 
      !lookingFor || // If no type specified, accept all
      lookingFor === 'both' || // Show all products if looking for both
      (lookingFor === 'capital' && (
        category.includes('Working Capital') || 
        category.includes('Business Loan') || 
        category.includes('Term Loan') ||
        category.includes('Line of Credit')
      )) ||
      (lookingFor === 'equipment' && category.includes('Equipment'));

    const match = isActive && countryMatch && amountMatch && typeMatch;
    
    console.log(`[filterProducts] ${product.name || product.lender_name}: Active(${isActive}) + Country(${countryMatch}) + Amount(${amountMatch}) + Type(${typeMatch}) = ${match}`);

    return match;
  });

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