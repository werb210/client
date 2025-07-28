import { LenderProduct } from '../types/lenderProduct';
import { 
  getAmountRange, 
  getGeography, 
  getProductCategory,
  matchesCategory,
  hasAmountFields,
  normalizeCountryCode
} from './fieldAccess';

export interface RecommendationFormData {
  headquarters: string; // 'US' or 'CA'
  fundingAmount: number;
  lookingFor: 'capital' | 'equipment' | 'both';
  accountsReceivableBalance: number;
  fundsPurpose: string;
}

// Legacy helper for backward compatibility - use fieldAccess.ts functions instead
const getAmountValue = (product: any, field: 'min' | 'max'): number => {
  const range = getAmountRange(product);
  return field === 'min' ? range.min : range.max;
};

/**
 * Apply your business rules to filter staff database products
 * Based on Step 1 user answers to recommend best product categories
 */
export function filterProducts(products: LenderProduct[], form: RecommendationFormData): LenderProduct[] {
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

  // CONSOLIDATED SINGLE FILTERING LOGIC - UPDATED WITH UNIFIED FIELD ACCESS
  const filteredProducts = products.filter(product => {
    // 1. COUNTRY/GEOGRAPHY MATCH - Using unified geography access
    const geographies = getGeography(product);
    const countryMatch = geographies.some(geo => {
      const normalizedGeo = normalizeCountryCode(geo);
      return normalizedGeo === normalizedHQ || 
             normalizedGeo === 'BOTH' ||
             (normalizedHQ === 'CA' && normalizedGeo === 'CA') ||
             (normalizedHQ === 'US' && normalizedGeo === 'US');
    });
    
    // 2. FUNDING AMOUNT RANGE - Using unified amount access
    const amountRange = getAmountRange(product);
    const amountMatch = fundingAmount >= amountRange.min && fundingAmount <= amountRange.max;
    
    // 3. LINE OF CREDIT OVERRIDE RULE - Always include LOC if amount fits
    const productCategory = getProductCategory(product);
    const isLineOfCredit = matchesCategory('line of credit', productCategory) || 
                          productCategory?.toLowerCase().includes('line of credit') ||
                          productCategory?.toLowerCase().includes('loc');
    const LOC_OVERRIDE = isLineOfCredit && countryMatch && amountMatch;
    
    // 4. INVOICE FACTORING BUSINESS RULE - Using category helper
    const isInvoiceFactoring = matchesCategory('factoring', productCategory);
    const factorExclusion = isInvoiceFactoring && accountsReceivableBalance === 0;
    
    // 5. EQUIPMENT FINANCING BUSINESS RULE (RELAXED) - Using category helper
    const isEquipmentFinancing = matchesCategory('equipment', productCategory);
    const equipmentExclusion = isEquipmentFinancing && 
                              lookingFor === 'capital' && 
                              fundsPurpose !== 'equipment' &&
                              !fundsPurpose?.includes('equipment');
    
    // 6. PRODUCT TYPE MATCHING - Using fuzzy category matching with "both" logic fix
    let typeMatch = false;
    
    if (lookingFor === 'both') {
      // For "both", exclude equipment-only products - only include capital products that can be used for equipment
      const isCapitalProduct = matchesCategory('working_capital', productCategory) ||
                              matchesCategory('line of credit', productCategory) ||
                              productCategory?.toLowerCase().includes('term loan') ||
                              productCategory?.toLowerCase().includes('invoice factoring') ||
                              productCategory?.toLowerCase().includes('purchase order');
      
      // Equipment-only products are excluded when user selects "both"
      typeMatch = isCapitalProduct && !isEquipmentFinancing;
      
      if (isEquipmentFinancing && !isCapitalProduct) {
        console.log(`🔍 [BOTH_FILTER] ${product.name}: Equipment-only product excluded for 'both' selection`);
      }
    } else if (lookingFor === 'capital') {
      typeMatch = !isEquipmentFinancing;
    } else if (lookingFor === 'equipment') {
      typeMatch = isEquipmentFinancing || (fundsPurpose === 'equipment');
    }

    // FINAL DECISION: Standard match OR LOC override
    const standardMatch = countryMatch && amountMatch && !factorExclusion && !equipmentExclusion && typeMatch;
    const passes = standardMatch || LOC_OVERRIDE;
    
    // Debug logging for key products and all Working Capital products
    if (product.name?.includes('Accord') || product.name?.includes('Advance') || productCategory === 'Working Capital' || isLineOfCredit || !passes) {
      console.log(`🔍 [FILTER] ${product.name} (${productCategory}):`, {
        geographies: geographies.join(','),
        countryMatch,
        amount: `$${amountRange.min?.toLocaleString()}-$${amountRange.max?.toLocaleString()}`,
        amountMatch,
        typeMatch,
        factorExclusion,
        equipmentExclusion,
        LOC_OVERRIDE: LOC_OVERRIDE ? '✅ FORCED INCLUDE' : false,
        passes: passes ? '✅' : '❌'
      });
    }
    
    // Special logging for Working Capital products and LOC overrides
    if (productCategory === 'Working Capital') {
      console.log(`💼 [WORKING_CAPITAL_FILTER] ${product.name} (${product.lender_name || 'Unknown Lender'}):`, {
        id: product.id,
        passes,
        LOC_OVERRIDE: LOC_OVERRIDE ? '✅ FORCED BY LOC RULE' : false,
        reasons: {
          countryMatch: `${product.country} === ${normalizedHQ} = ${countryMatch}`,
          amountMatch: `${amountRange.min} <= ${fundingAmount} <= ${amountRange.max} = ${amountMatch}`,
          typeMatch: `Type filtering = ${typeMatch}`,
          factorExclusion: `Factor excluded = ${factorExclusion}`,
          equipmentExclusion: `Equipment excluded = ${equipmentExclusion}`
        }
      });
    }
    
    // Log LOC override decisions
    if (LOC_OVERRIDE) {
      console.log(`🔗 [LOC_OVERRIDE] ${product.name}: FORCE INCLUDED - Line of Credit rule applied`);
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
  product: LenderProduct, 
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