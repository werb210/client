/**
 * Comprehensive Step 2 Recommendation Engine Debugger
 * 
 * This module provides detailed analysis of why lender products are or aren't
 * showing up in Step 2 recommendations, following the exact filtering logic
 * used in the actual recommendation engine.
 */

export interface FilterTestResult {
  productId: string;
  productName: string;
  lenderName: string;
  category: string;
  country: string;
  amountRange: { min: number | null; max: number | null };
  passed: boolean;
  failureReasons: string[];
  score?: number;
}

export interface RecommendationDebugResult {
  totalProducts: number;
  passedProducts: FilterTestResult[];
  failedProducts: FilterTestResult[];
  categoryBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  executionTimeMs: number;
}

export interface DebugInput {
  country: string;
  amountRequested: number;
  category: string;
  purposeOfFunds?: string;
}

/**
 * Debug the recommendation filtering process
 */
export async function debugRecommendationFiltering(
  products: any[], 
  input: DebugInput
): Promise<RecommendationDebugResult> {
  const startTime = performance.now();
  
  console.log('🧪 [RECOMMENDATION DEBUG] Starting analysis with:', input);
  
  const passedProducts: FilterTestResult[] = [];
  const failedProducts: FilterTestResult[] = [];
  const categoryBreakdown: Record<string, number> = {};
  const countryBreakdown: Record<string, number> = {};
  
  for (const product of products) {
    const result = analyzeProductFiltering(product, input);
    
    if (result.passed) {
      passedProducts.push(result);
      categoryBreakdown[result.category] = (categoryBreakdown[result.category] || 0) + 1;
      countryBreakdown[result.country] = (countryBreakdown[result.country] || 0) + 1;
    } else {
      failedProducts.push(result);
    }
  }
  
  const executionTimeMs = performance.now() - startTime;
  
  const debugResult: RecommendationDebugResult = {
    totalProducts: products.length,
    passedProducts,
    failedProducts,
    categoryBreakdown,
    countryBreakdown,
    executionTimeMs
  };
  
  console.log('🎯 [RECOMMENDATION DEBUG] Analysis complete:', debugResult);
  
  return debugResult;
}

/**
 * Analyze a single product against filtering criteria
 */
function analyzeProductFiltering(product: any, input: DebugInput): FilterTestResult {
  const failureReasons: string[] = [];
  let passed = true;
  
  // Extract product details using the same logic as the actual recommendation engine
  const productName = getProductName(product);
  const lenderName = getLenderName(product);
  const category = getProductCategory(product);
  const country = getProductCountry(product);
  const amountRange = getAmountRange(product);
  
  // Test 1: Country filtering
  const normalizedProductCountry = normalizeCountry(country);
  const normalizedInputCountry = normalizeCountry(input.country);
  
  if (normalizedProductCountry && normalizedInputCountry !== 'both') {
    if (normalizedProductCountry !== normalizedInputCountry) {
      passed = false;
      failureReasons.push(`Country mismatch: ${country} (${normalizedProductCountry}) ≠ ${input.country} (${normalizedInputCountry})`);
    }
  }
  
  // Test 2: Amount range filtering
  if (amountRange.min !== null && input.amountRequested < amountRange.min) {
    passed = false;
    failureReasons.push(`Amount too low: $${input.amountRequested.toLocaleString()} < minimum $${amountRange.min.toLocaleString()}`);
  }
  
  if (amountRange.max !== null && input.amountRequested > amountRange.max) {
    passed = false;
    failureReasons.push(`Amount too high: $${input.amountRequested.toLocaleString()} > maximum $${amountRange.max.toLocaleString()}`);
  }
  
  // Test 3: Category matching
  if (!categoryMatches(category, input.category)) {
    passed = false;
    failureReasons.push(`Category mismatch: "${category}" does not match "${input.category}"`);
  }
  
  // Test 4: Purpose of funds (if specified and product has restrictions)
  if (input.purposeOfFunds) {
    const supportedPurposes = getSupportedPurposes(product);
    if (supportedPurposes.length > 0 && !supportedPurposes.some(purpose => 
      purpose.toLowerCase().includes(input.purposeOfFunds!.toLowerCase())
    )) {
      // This is often informational rather than a hard filter
      failureReasons.push(`Purpose note: "${input.purposeOfFunds}" not explicitly supported. Supported: ${supportedPurposes.join(', ')}`);
    }
  }
  
  // Calculate score for passed products
  let score = 0;
  if (passed) {
    score = calculateProductScore(product, input);
  }
  
  return {
    productId: product.id || `${lenderName}-${productName}`,
    productName,
    lenderName,
    category,
    country,
    amountRange,
    passed,
    failureReasons: failureReasons.length > 0 ? failureReasons : ['✅ All criteria passed'],
    score
  };
}

/**
 * Field access helpers - these match the actual recommendation engine logic
 */
function getProductName(product: any): string {
  return product.name || product.productName || product.product_name || 'Unknown Product';
}

function getLenderName(product: any): string {
  return product.lenderName || product.lender_name || product.company || product.provider || 'Unknown Lender';
}

function getProductCategory(product: any): string {
  return product.category || product.productType || product.product_type || product.type || 'Unknown';
}

function getProductCountry(product: any): string {
  return product.country || product.geography || product.location || product.region || '';
}

function getAmountRange(product: any): { min: number | null; max: number | null } {
  // Try multiple field name variations
  const min = product.amount_min || product.amountMin || product.fundingMin || product.minAmount || product.min_amount || null;
  const max = product.amount_max || product.amountMax || product.fundingMax || product.maxAmount || product.max_amount || null;
  
  return {
    min: min ? Number(min) : null,
    max: max ? Number(max) : null
  };
}

function getSupportedPurposes(product: any): string[] {
  if (product.useCases && Array.isArray(product.useCases)) return product.useCases;
  if (product.use_cases && Array.isArray(product.use_cases)) return product.use_cases;
  if (product.supportedPurposes && Array.isArray(product.supportedPurposes)) return product.supportedPurposes;
  if (product.purposeOfFunds) return [product.purposeOfFunds];
  return [];
}

/**
 * Country normalization - matches actual recommendation engine
 */
function normalizeCountry(country: string): string {
  if (!country) return '';
  
  const normalized = country.toLowerCase().trim();
  
  // Handle variations of Canada
  if (normalized === 'ca' || normalized === 'canada' || normalized === 'canadian') {
    return 'canada';
  }
  
  // Handle variations of USA
  if (normalized === 'us' || normalized === 'usa' || normalized === 'united states' || 
      normalized === 'america' || normalized === 'american') {
    return 'usa';
  }
  
  // Handle both/all countries
  if (normalized === 'both' || normalized === 'all' || normalized === 'north america') {
    return 'both';
  }
  
  return normalized;
}

/**
 * Category matching - handles variations and aliases
 */
function categoryMatches(productCategory: string, inputCategory: string): boolean {
  if (!productCategory || !inputCategory) return false;
  
  // Normalize both categories for comparison
  const normalizeCategory = (cat: string) => 
    cat.toLowerCase()
       .replace(/[^a-z0-9]/g, '') // Remove special characters
       .replace(/financing$/, '') // Remove "financing" suffix
       .replace(/loan$/, ''); // Remove "loan" suffix
  
  const normalizedProduct = normalizeCategory(productCategory);
  const normalizedInput = normalizeCategory(inputCategory);
  
  // Direct match
  if (normalizedProduct === normalizedInput) return true;
  
  // Handle common aliases
  const aliases: Record<string, string[]> = {
    'equipment': ['equipmentfinancing', 'equipment'],
    'termLoan': ['term', 'termloan'],
    'workingcapital': ['working', 'workingcapital'],
    'lineofcredit': ['loc', 'line', 'lineofcredit', 'businesslineofcredit'],
    'invoicefactoring': ['factoring', 'invoice', 'invoicefactoring'],
    'assetbasedlending': ['asset', 'assetbased', 'assetbasedlending'],
    'purchaseorder': ['po', 'purchaseorder', 'purchaseorderfinancing']
  };
  
  // Check if input matches any alias that maps to the product category
  for (const [key, values] of Object.entries(aliases)) {
    if (values.includes(normalizedProduct) && values.includes(normalizedInput)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate product score for ranking
 */
function calculateProductScore(product: any, input: DebugInput): number {
  let score = 100; // Base score
  
  // Exact category match bonus
  if (getProductCategory(product).toLowerCase() === input.category.toLowerCase()) {
    score += 20;
  }
  
  // Amount range fit scoring
  const amountRange = getAmountRange(product);
  if (amountRange.min !== null && amountRange.max !== null) {
    const range = amountRange.max - amountRange.min;
    const position = (input.amountRequested - amountRange.min) / range;
    
    // Sweet spot is 20%-80% of the range
    if (position >= 0.2 && position <= 0.8) {
      score += 15;
    } else if (position >= 0.1 && position <= 0.9) {
      score += 10;
    }
  }
  
  // Country preference scoring
  const productCountry = normalizeCountry(getProductCountry(product));
  const inputCountry = normalizeCountry(input.country);
  
  if (productCountry === inputCountry) {
    score += 10;
  } else if (productCountry === 'both') {
    score += 5; // Slight preference for country-specific lenders
  }
  
  return Math.round(score);
}

/**
 * Generate common test scenarios for debugging
 */
export function getCommonTestScenarios(): Array<{ name: string; input: DebugInput }> {
  return [
    {
      name: 'Canadian Term Loan - $100K',
      input: {
        country: 'Canada',
        amountRequested: 100000,
        category: 'Term Loan',
        purposeOfFunds: 'Working Capital'
      }
    },
    {
      name: 'US Equipment Financing - $50K',
      input: {
        country: 'USA',
        amountRequested: 50000,
        category: 'Equipment Financing',
        purposeOfFunds: 'Equipment Purchase'
      }
    },
    {
      name: 'Canadian Line of Credit - $25K',
      input: {
        country: 'Canada',
        amountRequested: 25000,
        category: 'Business Line of Credit',
        purposeOfFunds: 'Working Capital'
      }
    },
    {
      name: 'Large Canadian Working Capital - $500K',
      input: {
        country: 'Canada',
        amountRequested: 500000,
        category: 'Working Capital',
        purposeOfFunds: 'Business Expansion'
      }
    },
    {
      name: 'Small US Invoice Factoring - $10K',
      input: {
        country: 'USA',
        amountRequested: 10000,
        category: 'Invoice Factoring',
        purposeOfFunds: 'Cash Flow'
      }
    },
    {
      name: 'Edge Case - Very Small Amount',
      input: {
        country: 'Canada',
        amountRequested: 1000,
        category: 'Working Capital',
        purposeOfFunds: 'Emergency Funding'
      }
    },
    {
      name: 'Edge Case - Very Large Amount',
      input: {
        country: 'USA',
        amountRequested: 2000000,
        category: 'Term Loan',
        purposeOfFunds: 'Major Expansion'
      }
    }
  ];
}