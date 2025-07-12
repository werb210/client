// Import and use the official LenderProduct type from schema
import { LenderProduct } from '../../../shared/lenderProductSchema';

// Use the normalized LenderProduct type from schema
export type StaffLenderProduct = LenderProduct;

export interface RecommendationFormData {
  headquarters: string; // 'US' or 'CA'
  fundingAmount: number;
  lookingFor: 'capital' | 'equipment' | 'both';
  accountsReceivableBalance: number;
  fundsPurpose: string;
}

/**
 * Apply your business rules to filter staff database products
 * Based on Step 1 user answers to recommend best product categories
 */
export function filterProducts(products: StaffLenderProduct[], form: RecommendationFormData): StaffLenderProduct[] {
  const {
    headquarters,
    fundingAmount,
    lookingFor,
    accountsReceivableBalance,
    fundsPurpose,
  } = form;

  // Debug logging disabled for production
  // console.log('[FILTER] DEBUG - Input parameters:', {
  //   productCount: products.length,
  //   headquarters,
  //   fundingAmount,
  //   lookingFor,
  //   accountsReceivableBalance,
  //   fundsPurpose,
  //   sampleProduct: products[0]
  // });

  // Convert amounts to numbers for comparison - handles both string and number types
  const getAmountValue = (amount: string | number): number => {
    if (typeof amount === 'number') return amount;
    return parseFloat(amount) || 0;
  };

  // Core filtering logic - Updated to use actual API response format
  const matchesCore = products.filter(product => {
    const minAmount = getAmountValue(product.minAmount);
    const maxAmount = getAmountValue(product.maxAmount);
    
    // Safe geography check - handle both geography and country fields from API
    const geography = Array.isArray(product.geography) ? product.geography : 
                     typeof product.geography === 'string' ? [product.geography] :
                     product.country ? [product.country] : [];
    
    return (
      // 1. Country match - geography contains headquarters
      geography.includes(headquarters) &&
      // 2. Amount range - within min/max bounds
      fundingAmount >= minAmount && fundingAmount <= maxAmount &&
      // 3. Product-type rules using staff database categories
      (
        lookingFor === "both" ||
        (lookingFor === "capital" && !product.category.toLowerCase().includes("equipment")) ||
        (lookingFor === "equipment" && product.category.toLowerCase().includes("equipment"))
      )
    );
  });

  // Extra inclusions based on special rules - Updated to use actual API response format
  const extras = products.filter(product => {
    const minAmount = getAmountValue(product.minAmount);
    const maxAmount = getAmountValue(product.maxAmount);
    
    // Safe geography check - handle both geography and country fields from API
    const geography = Array.isArray(product.geography) ? product.geography : 
                     typeof product.geography === 'string' ? [product.geography] :
                     product.country ? [product.country] : [];
    
    return (
      // Geography and amount must still match for extras
      geography.includes(headquarters) &&
      fundingAmount >= minAmount && fundingAmount <= maxAmount &&
      (
        // 4. AR balance rule - include invoice factoring ONLY when they have OR might have receivables
        // FIXED: Only show factoring when accountsReceivableBalance > 0 OR when explicitly looking for factoring future receivables
        (product.category.toLowerCase().includes("factoring") && accountsReceivableBalance > 0) ||
        // 5. Inventory purpose rule - include purchase order financing for inventory
        (fundsPurpose === "inventory" && product.category.toLowerCase().includes("purchase order"))
      )
    );
  });

  // Merge and deduplicate by id
  const byId = new Map<string, StaffLenderProduct>();
  [...matchesCore, ...extras].forEach(p => byId.set(p.id, p));
  
  const finalResults = Array.from(byId.values());
  
  // Debug logging disabled for production
  // Final results calculated and returned
  
  return finalResults;
}

/**
 * Calculate recommendation score based on Step 1 form data
 */
export function calculateRecommendationScore(
  product: StaffLenderProduct, 
  form: RecommendationFormData,
  monthlyRevenue: number
): number {
  let score = 0;
  const {
    headquarters,
    fundingAmount,
    lookingFor,
    accountsReceivableBalance,
    fundsPurpose,
  } = form;

  const minAmount = getAmountValue(product.minAmount);
  const maxAmount = getAmountValue(product.maxAmount);
  const minMonthlyRevenue = product.minRevenue || 0;

  // Geography match (25 points) - Safe geography check
  const geography = Array.isArray(product.geography) ? product.geography : 
                   typeof product.geography === 'string' ? [product.geography] :
                   product.country ? [product.country] : [];
  if (geography.includes(headquarters)) {
    score += 25;
  }

  // Funding range match (25 points)
  if (fundingAmount >= minAmount && fundingAmount <= maxAmount) {
    score += 25;
  }

  // Product type preference match (25 points)
  if (lookingFor === "both" ||
      (lookingFor === "capital" && !product.category.toLowerCase().includes("equipment")) ||
      (lookingFor === "equipment" && product.category.toLowerCase().includes("equipment"))) {
    score += 25;
  }

  // Revenue requirement match (25 points)
  if (monthlyRevenue >= minMonthlyRevenue) {
    score += 25;
  }

  // Bonus points for special matching rules
  if (product.category.toLowerCase().includes("factoring")) {
    score += 10; // Bonus for factoring (existing or future receivables)
  }
  
  if (fundsPurpose === "inventory" && product.category.toLowerCase().includes("purchase order")) {
    score += 10; // Bonus for PO financing match
  }

  return Math.min(score, 100); // Cap at 100%
}