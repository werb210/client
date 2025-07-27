/**
 * Advanced Recommendation Engine with Scoring Logic
 * Enhanced scoring system with interest rate prioritization and country/product overrides
 */

export interface LenderProduct {
  id: string;
  name: string;
  lenderName: string;
  category: string;
  country: string;
  amount_min: number;
  amount_max: number;
  interestRate?: string;
  useCases?: string[];
  description?: string;
  [key: string]: any;
}

export interface ScoredProduct extends LenderProduct {
  productId: string;
  matchScore: number;
  rejectionReasons: string[];
  matchedFilters: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  scoreBreakdown: {
    baseScore: number;
    categoryMatch: number;
    amountFit: number;
    countryPreference: number;
    interestRateBonus: number;
    topLenderBonus: number;
    strongFinancialsBonus: number;
  };
  matchReasons: string[];
  disqualificationReasons?: string[];
}

export interface FilteringOptions {
  showFilteredOut: boolean;
  applyOverrideBoosts: boolean;
  logInternalScoring: boolean;
}

export interface RecommendationInput {
  country: string;
  amountRequested: number;
  category: string;
  purposeOfFunds: string;
  hasStrongFinancials?: boolean;
  lastYearRevenue?: number;
}

/**
 * Top lender overrides by country and product category
 */
const TOP_LENDER_OVERRIDES: Record<string, Record<string, string[]>> = {
  'Canada': {
    'Working Capital': ['BDC Capital', 'Accord Financial', 'Advance Funds Network'],
    'Equipment Financing': ['Roynat Capital', 'Canadian Equipment Finance'],
    'Business Line of Credit': ['Accord Financial', 'Merchant Growth Capital'],
    'Term Loan': ['BDC Capital', 'Export Development Canada']
  },
  'USA': {
    'Working Capital': ['American Business Capital', 'SBA Preferred Lender'],
    'Equipment Financing': ['Equipment Finance USA'],
    'Term Loan': ['SBA Preferred Lender'],
    'Invoice Factoring': ['US Factor Solutions']
  }
};

/**
 * Parse interest rate from string format (e.g., "5.5%-8.0%" -> 5.5)
 */
function parseInterestRate(rateString?: string): number | null {
  if (!rateString) return null;
  
  const match = rateString.match(/(\d+\.?\d*)%?/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Calculate amount fit score based on how well the requested amount fits within the lender's range
 */
function calculateAmountFitScore(amountRequested: number, minAmount: number, maxAmount: number): number {
  const range = maxAmount - minAmount;
  const position = (amountRequested - minAmount) / range;
  
  // Optimal position is around 30-70% of the range
  if (position >= 0.3 && position <= 0.7) {
    return 100; // Perfect fit
  } else if (position >= 0.1 && position <= 0.9) {
    return 80; // Good fit
  } else if (position >= 0 && position <= 1) {
    return 60; // Acceptable fit
  } else {
    return 0; // Outside range
  }
}

/**
 * Check if product matches the requested category
 */
function matchesCategory(productCategory: string, requestedCategory: string): boolean {
  const productLower = productCategory.toLowerCase();
  const requestedLower = requestedCategory.toLowerCase();
  
  // Direct match
  if (productLower === requestedLower) return true;
  
  // Category aliases - Enhanced with plural forms and variations
  const aliases: Record<string, string[]> = {
    'working capital': ['business working capital', 'working capital loan', 'working capital financing', 'working capitals'],
    'equipment financing': ['equipment loan', 'equipment finance', 'equipment purchase', 'equipment financings'],
    'business line of credit': ['line of credit', 'credit line', 'revolving credit', 'business lines of credit'],
    'term loan': ['business term loan', 'commercial term loan', 'sba term loan', 'term loans'],
    'invoice factoring': ['accounts receivable financing', 'factoring', 'ar financing', 'invoice factorings']
  };
  
  // Handle plural forms - Convert "Term Loans" to "Term Loan" for matching
  // Use .toLowerCase().replace(/s$/, '') as specified by user
  const normalizeCategory = (category: string): string => {
    return category.toLowerCase().replace(/s$/, '');
  };
  
  const normalizedRequested = normalizeCategory(requestedCategory);
  const normalizedProduct = normalizeCategory(productCategory);
  
  // Direct match with normalized categories
  if (normalizedProduct === normalizedRequested) return true;
  
  return aliases[normalizedRequested]?.some(alias => normalizedProduct.includes(alias)) || false;
}

/**
 * Apply advanced scoring logic to a single product
 */
function scoreProduct(
  product: LenderProduct,
  input: RecommendationInput,
  options: FilteringOptions
): ScoredProduct {
  const scoreBreakdown = {
    baseScore: 50, // Starting base score
    categoryMatch: 0,
    amountFit: 0,
    countryPreference: 0,
    interestRateBonus: 0,
    topLenderBonus: 0,
    strongFinancialsBonus: 0
  };
  
  const matchReasons: string[] = [];
  const disqualificationReasons: string[] = [];
  
  // 1. Category matching (0-20 points) - USER SPECIFIED: +20 points for category match
  if (matchesCategory(product.category, input.category)) {
    scoreBreakdown.categoryMatch = 20;
    matchReasons.push(`Category match: ${product.category}`);
  } else {
    scoreBreakdown.categoryMatch = 0;
    disqualificationReasons.push(`Category mismatch: ${product.category} vs ${input.category}`);
  }
  
  // 2. Amount fit scoring (0-25 points)
  if (input.amountRequested >= product.amount_min && input.amountRequested <= product.amount_max) {
    scoreBreakdown.amountFit = calculateAmountFitScore(
      input.amountRequested,
      product.amount_min,
      product.amount_max
    ) * 0.25; // Scale to 25 points max
    matchReasons.push(`Amount fit: $${input.amountRequested.toLocaleString()} within $${product.amount_min.toLocaleString()}-$${product.amount_max.toLocaleString()}`);
  } else {
    scoreBreakdown.amountFit = 0;
    disqualificationReasons.push(`Amount out of range: $${input.amountRequested.toLocaleString()} not in $${product.amount_min.toLocaleString()}-$${product.amount_max.toLocaleString()}`);
  }
  
  // 3. Country preference (0-30 points) - USER SPECIFIED: +30 points for country match
  // Normalize "US" / "USA" and "CA" / "Canada" consistently
  const normalizedCountry = (input.country === 'US' || input.country === 'USA') ? 'USA' : 
                           (input.country === 'CA' || input.country === 'Canada') ? 'Canada' : 
                           input.country;
  const productCountry = (product.country === 'US' || product.country === 'USA') ? 'USA' : 
                        (product.country === 'CA' || product.country === 'Canada') ? 'Canada' : 
                        product.country;
  
  if (productCountry === normalizedCountry) {
    scoreBreakdown.countryPreference = 30;
    matchReasons.push(`Country match: ${productCountry}`);
  } else if (productCountry === 'US/CA' || productCountry === 'Both' || productCountry === 'North America') {
    scoreBreakdown.countryPreference = 20;
    matchReasons.push(`Multi-country lender: ${productCountry}`);
  } else {
    scoreBreakdown.countryPreference = 0;
    disqualificationReasons.push(`Country mismatch: ${productCountry} vs ${normalizedCountry}`);
  }
  
  // 4. Interest rate bonus (0-15 points)
  const interestRate = parseInterestRate(product.interestRate);
  if (interestRate !== null) {
    if (interestRate <= 5.0) {
      scoreBreakdown.interestRateBonus = 15;
      matchReasons.push(`Excellent rate: ${product.interestRate}`);
    } else if (interestRate <= 8.0) {
      scoreBreakdown.interestRateBonus = 10;
      matchReasons.push(`Good rate: ${product.interestRate}`);
    } else if (interestRate <= 12.0) {
      scoreBreakdown.interestRateBonus = 5;
      matchReasons.push(`Standard rate: ${product.interestRate}`);
    }
  }
  
  // 5. Top lender bonus (0-10 points) - only if overrides enabled
  if (options.applyOverrideBoosts) {
    const topLenders = TOP_LENDER_OVERRIDES[normalizedCountry]?.[input.category] || [];
    if (topLenders.includes(product.lenderName)) {
      scoreBreakdown.topLenderBonus = 10;
      matchReasons.push(`Top lender for ${input.category} in ${normalizedCountry}`);
    }
  }
  
  // 6. Strong financials bonus (0-5 points)
  if (input.hasStrongFinancials && options.applyOverrideBoosts) {
    scoreBreakdown.strongFinancialsBonus = 5;
    matchReasons.push('Strong financials bonus applied');
  }
  
  // Calculate total score
  const totalScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);
  
  if (options.logInternalScoring) {
    console.log(`🎯 [SCORING] ${product.name} (${product.lenderName}):`, {
      totalScore,
      breakdown: scoreBreakdown,
      matchReasons,
      disqualificationReasons
    });
  }
  
  // Determine confidence level based on score
  const confidenceLevel: 'high' | 'medium' | 'low' = 
    totalScore >= 70 ? 'high' : 
    totalScore >= 50 ? 'medium' : 'low';

  // Generate matched filters list
  const matchedFilters: string[] = [];
  if (scoreBreakdown.countryPreference > 0) matchedFilters.push(`Country: ${input.country}`);
  if (scoreBreakdown.categoryMatch > 0) matchedFilters.push(`Category: ${input.category}`);
  if (scoreBreakdown.amountFit > 0) matchedFilters.push(`Amount: ${input.amountRequested.toLocaleString()}`);
  if (input.purposeOfFunds) matchedFilters.push(`Purpose: ${input.purposeOfFunds}`);

  return {
    ...product,
    productId: product.id,
    matchScore: totalScore,
    rejectionReasons: disqualificationReasons,
    matchedFilters,
    confidenceLevel,
    score: totalScore, // Keep backwards compatibility
    scoreBreakdown,
    matchReasons,
    disqualificationReasons: disqualificationReasons.length > 0 ? disqualificationReasons : undefined
  };
}

/**
 * Advanced recommendation engine with scoring and filtering
 */
export function getAdvancedRecommendations(
  products: LenderProduct[],
  input: RecommendationInput,
  options: FilteringOptions = {
    showFilteredOut: false,
    applyOverrideBoosts: true,
    logInternalScoring: false
  }
): {
  qualifiedProducts: ScoredProduct[];
  filteredOutProducts: ScoredProduct[];
  totalProcessed: number;
  executionTime: number;
} {
  const startTime = performance.now();
  
  if (options.logInternalScoring) {
    console.log('🚀 [RECOMMENDATION ENGINE] Starting advanced scoring...', {
      input,
      options,
      productCount: products.length
    });
  }
  
  // Score all products
  const scoredProducts = products.map(product => scoreProduct(product, input, options));
  
  // Separate qualified and disqualified products
  const qualifiedProducts = scoredProducts
    .filter(product => {
      // Must have category match, amount fit, and country preference to qualify
      return product.scoreBreakdown.categoryMatch > 0 &&
             product.scoreBreakdown.amountFit > 0 &&
             product.scoreBreakdown.countryPreference > 0;
    })
    .sort((a, b) => b.score - a.score); // Sort by score descending
  
  const filteredOutProducts = scoredProducts
    .filter(product => {
      return product.scoreBreakdown.categoryMatch === 0 ||
             product.scoreBreakdown.amountFit === 0 ||
             product.scoreBreakdown.countryPreference === 0;
    })
    .sort((a, b) => b.score - a.score);
  
  const executionTime = performance.now() - startTime;
  
  if (options.logInternalScoring) {
    console.log('✅ [RECOMMENDATION ENGINE] Scoring complete:', {
      qualified: qualifiedProducts.length,
      filteredOut: filteredOutProducts.length,
      executionTime: executionTime.toFixed(2) + 'ms'
    });
  }
  
  return {
    qualifiedProducts,
    filteredOutProducts: options.showFilteredOut ? filteredOutProducts : [],
    totalProcessed: products.length,
    executionTime
  };
}

/**
 * Get available categories from products
 */
export function getAvailableCategories(products: LenderProduct[]): string[] {
  const categories = new Set(products.map(p => p.category));
  return Array.from(categories).sort();
}

/**
 * Get available countries from products
 */
export function getAvailableCountries(products: LenderProduct[]): string[] {
  const countries = new Set(products.map(p => p.country));
  return Array.from(countries).sort();
}