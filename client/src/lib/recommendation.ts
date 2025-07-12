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

  // Temporary debug logging to diagnose filtering issue
  console.log('[DEBUG] filterProducts - Input parameters:', {
    productCount: products.length,
    headquarters,
    fundingAmount,
    lookingFor,
    accountsReceivableBalance,
    fundsPurpose,
    sampleProducts: products.slice(0, 3).map(p => ({
      name: p.name,
      category: p.category,
      geography: p.geography,
      country: p.country,
      minAmount: p.minAmount,
      maxAmount: p.maxAmount
    }))
  });

  // Helper function to get amount value with multiple field name support
  const getAmountValue = (product: any, field: 'min' | 'max'): number => {
    let amount: any;
    if (field === 'min') {
      amount = product.minAmount ?? product.amountMin ?? product.amount_min ?? product.fundingMin ?? 0;
    } else {
      amount = product.maxAmount ?? product.amountMax ?? product.amount_max ?? product.fundingMax ?? Infinity;
    }
    
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') return parseFloat(amount.replace(/[^0-9.-]/g, '')) || (field === 'min' ? 0 : Infinity);
    return field === 'min' ? 0 : Infinity;
  };

  // Helper function to get geography/country with multiple field name support
  const getGeography = (product: any): string[] => {
    // Try different field names for geography/country
    const geography = product.geography ?? product.countries ?? product.markets ?? product.country;
    
    if (Array.isArray(geography)) return geography;
    if (typeof geography === 'string') return [geography];
    return [];
  };

  // Helper function to normalize headquarters format
  const normalizeHeadquarters = (hq: string): string => {
    if (hq === 'united-states' || hq === 'United States' || hq === 'US') return 'US';
    if (hq === 'canada' || hq === 'Canada' || hq === 'CA') return 'CA';
    return hq;
  };

  const normalizedHQ = normalizeHeadquarters(headquarters);

  // Core filtering logic - Fixed field mapping
  const matchesCore = products.filter(product => {
    const minAmount = getAmountValue(product, 'min');
    const maxAmount = getAmountValue(product, 'max');
    const geography = getGeography(product);
    
    // Geography check - support multiple formats
    const geographyMatch = !normalizedHQ || 
                          geography.includes(normalizedHQ) || 
                          geography.includes('US/CA') || 
                          geography.includes('CA/US') ||
                          (normalizedHQ === 'US' && geography.includes('United States')) ||
                          (normalizedHQ === 'CA' && geography.includes('Canada'));
    
    // Amount check - ensure fundingAmount is within range
    const amountMatch = fundingAmount >= minAmount && fundingAmount <= maxAmount;
    
    // Type check - improved category matching
    const categoryLower = product.category?.toLowerCase() || '';
    const typeMatch = lookingFor === "both" ||
      (lookingFor === "capital" && !categoryLower.includes("equipment")) ||
      (lookingFor === "equipment" && categoryLower.includes("equipment"));
    
    const passes = geographyMatch && amountMatch && typeMatch;
    
    // Log first few products for debugging
    if (products.indexOf(product) < 3) {
      console.log(`[DEBUG] Product ${product.name || product.lender}:`, {
        originalGeography: product.geography || product.country,
        normalizedGeography: geography,
        requestedHQ: normalizedHQ,
        geographyMatch,
        amountRange: `${minAmount}-${maxAmount}`,
        requestedAmount: fundingAmount,
        amountMatch,
        category: product.category,
        lookingFor,
        typeMatch,
        passes
      });
    }
    
    return passes;
  });

  // Extra inclusions based on special rules - Fixed field mapping
  const extras = products.filter(product => {
    const minAmount = getAmountValue(product, 'min');
    const maxAmount = getAmountValue(product, 'max');
    const geography = getGeography(product);
    
    // Geography check with normalized format
    const geographyMatch = !normalizedHQ || 
                          geography.includes(normalizedHQ) || 
                          geography.includes('US/CA') || 
                          geography.includes('CA/US') ||
                          (normalizedHQ === 'US' && geography.includes('United States')) ||
                          (normalizedHQ === 'CA' && geography.includes('Canada'));
    
    const amountMatch = fundingAmount >= minAmount && fundingAmount <= maxAmount;
    
    if (!geographyMatch || !amountMatch) return false;
    
    const categoryLower = product.category?.toLowerCase() || '';
    
    return (
      // AR balance rule - include invoice factoring ONLY when they have receivables
      (categoryLower.includes("factoring") && accountsReceivableBalance > 0) ||
      // Inventory purpose rule - include purchase order financing for inventory
      (fundsPurpose === "inventory" && categoryLower.includes("purchase order"))
    );
  });

  // Merge and deduplicate by id
  const byId = new Map<string, StaffLenderProduct>();
  [...matchesCore, ...extras].forEach(p => byId.set(p.id, p));
  
  const finalResults = Array.from(byId.values());
  
  // Temporary debug logging to show results
  console.log('[DEBUG] filterProducts - Results:', {
    coreMatches: matchesCore.length,
    extras: extras.length,
    finalResults: finalResults.length,
    categories: [...new Set(finalResults.map(p => p.category))]
  });
  
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

  const minAmount = getAmountValue(product, 'min');
  const maxAmount = getAmountValue(product, 'max');
  const minMonthlyRevenue = product.minRevenue || 0;
  const geography = getGeography(product);
  const normalizedHQ = normalizeHeadquarters(headquarters);

  // Geography match (25 points) - Fixed geography check
  if (geography.includes(normalizedHQ) || 
      geography.includes('US/CA') || 
      geography.includes('CA/US') ||
      (normalizedHQ === 'US' && geography.includes('United States')) ||
      (normalizedHQ === 'CA' && geography.includes('Canada'))) {
    score += 25;
  }

  // Funding range match (25 points)
  if (fundingAmount >= minAmount && fundingAmount <= maxAmount) {
    score += 25;
  }

  // Product type preference match (25 points)
  const categoryLower = product.category?.toLowerCase() || '';
  if (lookingFor === "both" ||
      (lookingFor === "capital" && !categoryLower.includes("equipment")) ||
      (lookingFor === "equipment" && categoryLower.includes("equipment"))) {
    score += 25;
  }

  // Revenue requirement match (25 points)
  if (monthlyRevenue >= minMonthlyRevenue) {
    score += 25;
  }

  // Bonus points for special matching rules
  if (categoryLower.includes("factoring") && accountsReceivableBalance > 0) {
    score += 10; // Bonus for factoring when they have receivables
  }
  
  if (fundsPurpose === "inventory" && categoryLower.includes("purchase order")) {
    score += 10; // Bonus for PO financing match
  }

  return Math.min(score, 100); // Cap at 100%
}

// Helper functions to be accessible from the module
function getAmountValue(product: any, field: 'min' | 'max'): number {
  let amount: any;
  if (field === 'min') {
    amount = product.minAmount ?? product.amountMin ?? product.amount_min ?? product.fundingMin ?? 0;
  } else {
    amount = product.maxAmount ?? product.amountMax ?? product.amount_max ?? product.fundingMax ?? Infinity;
  }
  
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') return parseFloat(amount.replace(/[^0-9.-]/g, '')) || (field === 'min' ? 0 : Infinity);
  return field === 'min' ? 0 : Infinity;
}

function getGeography(product: any): string[] {
  const geography = product.geography ?? product.countries ?? product.markets ?? product.country;
  
  if (Array.isArray(geography)) return geography;
  if (typeof geography === 'string') return [geography];
  return [];
}

function normalizeHeadquarters(hq: string): string {
  if (hq === 'united-states' || hq === 'United States' || hq === 'US') return 'US';
  if (hq === 'canada' || hq === 'Canada' || hq === 'CA') return 'CA';
  return hq;
}