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

  return products.filter(product => {
    // Country/headquarters matching
    const productCountry = product.country || product.headquarters;
    const formCountry = formData.headquarters;
    
    const countryMatch = 
      (formCountry === 'US' && (productCountry === 'US' || productCountry === 'United States')) ||
      (formCountry === 'CA' && (productCountry === 'CA' || productCountry === 'Canada')) ||
      (!productCountry) || // Accept products without country restrictions
      (productCountry === 'Both'); // Products available in both countries

    // Funding amount matching (more flexible)
    const fundingAmount = formData.fundingAmount || 50000;
    const minAmount = product.minAmount || product.amountMin || product.amount_min || 0;
    const maxAmount = product.maxAmount || product.amountMax || product.amount_max || 10000000;
    
    const amountMatch = fundingAmount >= minAmount && fundingAmount <= maxAmount;

    // Product type matching (flexible)
    const lookingFor = formData.lookingFor || 'capital';
    const category = product.category || '';
    
    const typeMatch = 
      lookingFor === 'both' || // Show all products if looking for both
      (lookingFor === 'capital' && (
        category.includes('Working Capital') || 
        category.includes('Business Loan') || 
        category.includes('Term Loan') ||
        category.includes('Line of Credit')
      )) ||
      (lookingFor === 'equipment' && category.includes('Equipment'));

    const match = countryMatch && amountMatch && typeMatch;
    
    if (!match) {
      console.log(`[filterProducts] Filtered out: ${product.name} - Country: ${countryMatch}, Amount: ${amountMatch}, Type: ${typeMatch}`);
    }

    return match;
  });
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