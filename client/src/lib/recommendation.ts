import { StaffLenderProduct } from '../types/staffApi';

export interface RecommendationFormData {
  headquarters: string; // 'US' or 'CA'
  fundingAmount: number;
  lookingFor: 'capital' | 'equipment' | 'both';
  accountsReceivableBalance: number;
  fundsPurpose: string;
}

// Helper function to get amount value with multiple field name support
const getAmountValue = (product: any, field: 'min' | 'max'): number => {
  let amount: any;
  if (field === 'min') {
    amount = product.minAmount ?? product.amountMin ?? product.amount_min ?? product.min_amount ?? product.fundingMin ?? 0;
  } else {
    amount = product.maxAmount ?? product.amountMax ?? product.amount_max ?? product.max_amount ?? product.fundingMax ?? Infinity;
  }
  
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') return parseFloat(amount.replace(/[^0-9.-]/g, '')) || (field === 'min' ? 0 : Infinity);
  return field === 'min' ? 0 : Infinity;
};

// Helper function to get geography/country with multiple field name support
const getGeography = (product: any): string[] => {
  const geography = product.geography ?? product.countries ?? product.markets ?? product.country;
  
  if (Array.isArray(geography)) {
    return geography.map(g => {
      if (typeof g === 'string') {
        return g.replace(/[{}[\]"]/g, '').trim().toUpperCase();
      }
      return String(g).toUpperCase();
    }).filter(g => g.length > 0);
  }
  if (typeof geography === 'string') {
    const cleaned = geography.replace(/[{}[\]"]/g, '').trim();
    if (cleaned.includes('/')) {
      return cleaned.split('/').map(c => c.trim().toUpperCase());
    }
    return [cleaned.toUpperCase()];
  }
  return [];
};

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

  // Check if we have any products at all
  if (!products || products.length === 0) {
    return [];
  }

  // Normalize headquarters/country consistently
  const normalizedHQ = (headquarters?.toLowerCase() === 'united-states' || 
                       headquarters?.toLowerCase() === 'united states' || 
                       headquarters === 'US') ? 'US' :
                      (headquarters?.toLowerCase() === 'canada' || 
                       headquarters === 'CA') ? 'CA' : 
                       (headquarters || 'CA'); // Default to CA if not specified

  console.log(`🔍 [FILTER] Starting with ${products.length} products for ${normalizedHQ} market`);

  // CONSOLIDATED SINGLE FILTERING LOGIC
  const filteredProducts = products.filter(product => {
    // 1. COUNTRY/GEOGRAPHY MATCH
    const countryMatch = product.country === normalizedHQ || 
                        product.country === 'Both' ||
                        product.geography?.includes(normalizedHQ) ||
                        (normalizedHQ === 'CA' && product.country?.includes('CA')) ||
                        (normalizedHQ === 'US' && product.country?.includes('US'));
    
    // 2. FUNDING AMOUNT RANGE
    const minAmount = getAmountValue(product, 'min');
    const maxAmount = getAmountValue(product, 'max');
    const amountMatch = fundingAmount >= minAmount && fundingAmount <= maxAmount;
    
    // 3. INVOICE FACTORING BUSINESS RULE
    const isInvoiceFactoring = product.category?.toLowerCase().includes('factoring') || 
                              product.category?.toLowerCase().includes('invoice');
    const factorExclusion = isInvoiceFactoring && accountsReceivableBalance === 0;
    
    // 4. EQUIPMENT FINANCING BUSINESS RULE (RELAXED)
    const isEquipmentFinancing = product.category?.toLowerCase().includes('equipment');
    const equipmentExclusion = isEquipmentFinancing && 
                              lookingFor === 'capital' && 
                              fundsPurpose !== 'equipment' &&
                              !fundsPurpose?.includes('equipment');
    
    // 5. PRODUCT TYPE MATCHING
    const categoryLower = product.category?.toLowerCase() || '';
    const typeMatch = lookingFor === 'both' ||
                     (lookingFor === 'capital' && !categoryLower.includes('equipment')) ||
                     (lookingFor === 'equipment' && categoryLower.includes('equipment')) ||
                     (fundsPurpose === 'equipment' && categoryLower.includes('equipment'));

    const passes = countryMatch && amountMatch && !factorExclusion && !equipmentExclusion && typeMatch;
    
    // Debug logging for key products
    if (product.name?.includes('Accord') || product.name?.includes('Advance') || !passes) {
      console.log(`🔍 [FILTER] ${product.name} (${product.category}):`, {
        country: product.country,
        countryMatch,
        amount: `$${minAmount?.toLocaleString()}-$${maxAmount?.toLocaleString()}`,
        amountMatch,
        typeMatch,
        factorExclusion,
        equipmentExclusion,
        passes
      });
    }
    
    return passes;
  });

  console.log(`🔍 [FILTER] Result: ${filteredProducts.length} products match filters`);
  
  return filteredProducts;
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

  // Geography match (25 points)
  if (geography.includes(normalizedHQ) || 
      geography.includes('US/CA') || 
      geography.includes('CA/US') ||
      (normalizedHQ === 'US' && geography.includes('UNITED STATES')) ||
      (normalizedHQ === 'CA' && geography.includes('CANADA')) ||
      product.country === normalizedHQ ||
      (normalizedHQ === 'CA' && product.country?.includes('CA')) ||
      (normalizedHQ === 'US' && product.country?.includes('US'))) {
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

function normalizeHeadquarters(hq: string): string {
  if (hq === 'united-states' || hq === 'United States' || hq === 'US') return 'US';
  if (hq === 'canada' || hq === 'Canada' || hq === 'CA') return 'CA';
  return hq;
}