// Import local type definitions to avoid deep import chains
import { LenderProduct, StaffLenderProduct } from '../types/lenderProduct';

export interface RecommendationFormData {
  headquarters: string; // 'US' or 'CA'
  fundingAmount: number;
  lookingFor: 'capital' | 'equipment' | 'both';
  accountsReceivableBalance: number;
  fundsPurpose: string;
}

// Helper function to get amount value with multiple field name support - MOVED TO TOP
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

  console.log('[FILTER] Starting with parameters:', {
    productCount: products.length,
    headquarters,
    fundingAmount,
    lookingFor,
    accountsReceivableBalance,
    fundsPurpose
  });
  
  // CRITICAL: Check if we have any products at all
  if (!products || products.length === 0) {
    console.log('[FILTER] No products provided to filter!');
    return [];
  }

  // ✅ STEP 1: EXCLUDE INVOICE FACTORING IF NOT ELIGIBLE
  let filteredProducts = products;
  
  // Check if user has accounts receivable (Step 1 answer)
  const hasAccountsReceivable = accountsReceivableBalance > 0;
  console.log('[FILTER] Has accounts receivable:', hasAccountsReceivable, '(balance:', accountsReceivableBalance, ')');
  
  if (!hasAccountsReceivable) {
    const beforeCount = filteredProducts.length;
    filteredProducts = filteredProducts.filter(product => product.category !== 'Invoice Factoring');
    const afterCount = filteredProducts.length;
    console.log('[FILTER] Excluded Invoice Factoring:', beforeCount - afterCount, 'products removed');
  }

  // ✅ STEP 2: FILTER BY COUNTRY (CA or US)
  const normalizedHQ = headquarters === 'united-states' || headquarters === 'United States' || headquarters === 'US' ? 'US' :
                       headquarters === 'canada' || headquarters === 'Canada' || headquarters === 'CA' ? 'CA' : 
                       headquarters;
  
  console.log('[FILTER] Filtering by country:', normalizedHQ);
  const beforeCountryFilter = filteredProducts.length;
  filteredProducts = filteredProducts.filter(product => product.country === normalizedHQ);
  const afterCountryFilter = filteredProducts.length;
  console.log('[FILTER] Country filter:', beforeCountryFilter - afterCountryFilter, 'products removed');

  // ✅ STEP 3: FILTER BY MINIMUM & MAXIMUM FUNDING AMOUNT
  console.log('[FILTER] Filtering by funding amount:', fundingAmount);
  const beforeAmountFilter = filteredProducts.length;
  filteredProducts = filteredProducts.filter(product => {
    const minAmount = getAmountValue(product, 'min');
    const maxAmount = getAmountValue(product, 'max');
    return fundingAmount >= minAmount && fundingAmount <= maxAmount;
  });
  const afterAmountFilter = filteredProducts.length;
  console.log('[FILTER] Amount filter:', beforeAmountFilter - afterAmountFilter, 'products removed');

  // ✅ STEP 4: GROUP BY CATEGORY (for display purposes)
  const categoryGroups = filteredProducts.reduce((groups, product) => {
    const category = product.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<string, StaffLenderProduct[]>);

  console.log('[FILTER] Final results by category:', 
    Object.entries(categoryGroups).map(([category, products]) => 
      `${category}: ${products.length} products`
    ).join(', ')
  );

  console.log('[FILTER] Total products after filtering:', filteredProducts.length);
  
  return filteredProducts;

  // Check for specific missing products (Accord and Small Business Revolver)
  const accordProducts = products.filter(p => 
    p.name?.toLowerCase().includes('accord') ||
    p.lender_name?.toLowerCase().includes('accord') ||
    p.product_name?.toLowerCase().includes('accord')
  );
  // console.log(`[DEBUG] Accord products found: ${accordProducts.length}`);
  accordProducts.forEach(p => {
    // console.log(`[DEBUG] Accord product: ${p.name} - Category: ${p.category}, Country: ${p.country}, Min: ${p.min_amount}, Max: ${p.max_amount}`);
  });

  const revolverProducts = products.filter(p => 
    p.name?.toLowerCase().includes('revolver') ||
    p.name?.toLowerCase().includes('small business')
  );
  // console.log(`[DEBUG] Small Business Revolver products found: ${revolverProducts.length}`);
  revolverProducts.forEach(p => {
    // console.log(`[DEBUG] Revolver product: ${p.name} - Category: ${p.category}, Country: ${p.country}, Min: ${p.min_amount}, Max: ${p.max_amount}`);
  });

  // Function moved to top of file to fix initialization error

  // Helper function to get geography/country with multiple field name support
  const getGeography = (product: any): string[] => {
    // Try different field names for geography/country
    const geography = product.geography ?? product.countries ?? product.markets ?? product.country;
    
    if (Array.isArray(geography)) {
      return geography.map(g => {
        // Handle stringified arrays like "{CA}" or similar formats
        if (typeof g === 'string') {
          return g.replace(/[{}[\]"]/g, '').trim().toUpperCase();
        }
        return String(g).toUpperCase();
      }).filter(g => g.length > 0);
    }
    if (typeof geography === 'string') {
      // Handle multi-country strings like "US/CA" and clean curly braces
      const cleaned = geography.replace(/[{}[\]"]/g, '').trim();
      if (cleaned.includes('/')) {
        return cleaned.split('/').map(c => c.trim().toUpperCase());
      }
      return [cleaned.toUpperCase()];
    }
    return [];
  };

  // Core filtering logic - Fixed field mapping
  const matchesCore = products.filter(product => {
    const minAmount = getAmountValue(product, 'min');
    const maxAmount = getAmountValue(product, 'max');
    const geography = getGeography(product);
    
    // Normalize headquarters inline
    const normalizedHQ = headquarters === 'united-states' || headquarters === 'United States' || headquarters === 'US' ? 'US' :
                         headquarters === 'canada' || headquarters === 'Canada' || headquarters === 'CA' ? 'CA' : 
                         headquarters;
    
    // Geography check - support multiple formats including direct country field
    const geographyMatch = !normalizedHQ || 
                          geography.includes(normalizedHQ) || 
                          geography.includes('US/CA') || 
                          geography.includes('CA/US') ||
                          (normalizedHQ === 'US' && geography.includes('UNITED STATES')) ||
                          (normalizedHQ === 'CA' && geography.includes('CANADA')) ||
                          // CRITICAL: Check the direct country field that most products use
                          product.country === normalizedHQ ||
                          (normalizedHQ === 'CA' && product.country?.includes('CA')) ||
                          (normalizedHQ === 'US' && product.country?.includes('US'));
    
    // Amount check - ensure fundingAmount is within range
    const amountMatch = fundingAmount >= minAmount && fundingAmount <= maxAmount;
    
    // Type check - improved category matching
    const categoryLower = product.category?.toLowerCase() || '';
    const typeMatch = lookingFor === "both" ||
      (lookingFor === "capital" && !categoryLower.includes("equipment")) ||
      (lookingFor === "equipment" && categoryLower.includes("equipment"));
    
    // CRITICAL: Exclude Invoice Factoring when accountsReceivableBalance = 0
    const factorExclusion = accountsReceivableBalance === 0 && 
                           (categoryLower.includes("factoring") || categoryLower.includes("invoice"));
    
    const passes = geographyMatch && amountMatch && typeMatch && !factorExclusion;
    
    // Log specific products for debugging
    if (product.name?.includes('Small Business Revolver') || product.name?.includes('Accord')) {
      // console.log(`[DEBUG] Product ${product.name}:`, {
      //   originalGeography: geography,
      //   normalizedGeography: geography,
      //   requestedHQ: normalizedHQ,
      //   geographyMatch,
      //   amountRange: `${minAmount}-${maxAmount}`,
      //   requestedAmount: fundingAmount,
      //   amountMatch,
      //   category: product.category,
      //   lookingFor,
      //   typeMatch,
      //   accountsReceivableBalance,
      //   factorExclusion,
      //   passes
      // });
    }
    if (products.indexOf(product) < 3) {
      const categoryLower = product.category?.toLowerCase() || '';
      const factorExclusion = accountsReceivableBalance === 0 && 
                             (categoryLower.includes("factoring") || categoryLower.includes("invoice"));
      
      // console.log(`[DEBUG] Product ${product.name || product.lender}:`, {
      //   originalGeography: product.geography || product.country,
      //   normalizedGeography: geography,
      //   requestedHQ: normalizedHQ,
      //   geographyMatch,
      //   amountRange: `${minAmount}-${maxAmount}`,
      //   requestedAmount: fundingAmount,
      //   amountMatch,
      //   category: product.category,
      //   lookingFor,
      //   typeMatch,
      //   accountsReceivableBalance,
      //   factorExclusion,
      //   passes: geographyMatch && amountMatch && typeMatch && !factorExclusion
      // });
    }
    
    return passes;
  });

  // Extra inclusions based on special rules - Fixed field mapping
  const extras = products.filter(product => {
    const minAmount = getAmountValue(product, 'min');
    const maxAmount = getAmountValue(product, 'max');
    const geography = getGeography(product);
    
    // Normalize headquarters inline
    const normalizedHQ = headquarters === 'united-states' || headquarters === 'United States' || headquarters === 'US' ? 'US' :
                         headquarters === 'canada' || headquarters === 'Canada' || headquarters === 'CA' ? 'CA' : 
                         headquarters;
    
    // Geography check with normalized format including direct country field
    const geographyMatch = !normalizedHQ || 
                          geography.includes(normalizedHQ) || 
                          geography.includes('US/CA') || 
                          geography.includes('CA/US') ||
                          (normalizedHQ === 'US' && geography.includes('UNITED STATES')) ||
                          (normalizedHQ === 'CA' && geography.includes('CANADA')) ||
                          // CRITICAL: Check the direct country field that most products use
                          product.country === normalizedHQ ||
                          (normalizedHQ === 'CA' && product.country?.includes('CA')) ||
                          (normalizedHQ === 'US' && product.country?.includes('US'));
    
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
  
  // Enhanced debug logging to show results
  // console.log('[DEBUG] filterProducts - Results:', {
  //   coreMatches: matchesCore.length,
  //   extras: extras.length,
  //   finalResults: finalResults.length,
  //   categories: [...new Set(finalResults.map(p => p.category))],
  //   accountsReceivableBalance,
  //   shouldExcludeFactoring: accountsReceivableBalance === 0
  // });
  
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

  // Geography match (25 points) - Fixed geography check including direct country field
  if (geography.includes(normalizedHQ) || 
      geography.includes('US/CA') || 
      geography.includes('CA/US') ||
      (normalizedHQ === 'US' && geography.includes('United States')) ||
      (normalizedHQ === 'CA' && geography.includes('Canada')) ||
      // CRITICAL: Check the direct country field that most products use
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

// Helper functions to be accessible from the module - getAmountValue moved to top

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