import { 
  LenderProduct, 
  LenderProductSchema, 
  StaffAPIResponse, 
  StaffAPIResponseSchema,
  DOCUMENT_REQUIREMENTS_MAP 
} from '@/../../shared/lenderProductSchema';

/**
 * Normalizes raw staff API data into strict validated LenderProduct model
 * Fails fast on invalid data to surface issues immediately
 */
export function normalizeProducts(rawData: unknown): LenderProduct[] {
  console.log('[NORMALIZER] Starting product normalization...');
  
  // First validate the API response structure
  const apiResponseValidation = StaffAPIResponseSchema.safeParse(rawData);
  if (!apiResponseValidation.success) {
    console.error('❌ [NORMALIZER] Invalid API response structure:', apiResponseValidation.error.issues);
    throw new Error('Staff API returned invalid response structure');
  }

  const { products } = apiResponseValidation.data;
  console.log(`[NORMALIZER] Processing ${products.length} raw products from staff API`);

  const normalizedProducts: LenderProduct[] = [];
  const errors: Array<{ index: number; productName?: string; issues: string[] }> = [];

  products.forEach((rawProduct, index) => {
    try {
      // Extract and parse rate information from description
      const rateInfo = parseRateFromDescription(rawProduct.description);
      const termInfo = parseTermFromDescription(rawProduct.description);
      
      // Normalize geography to single country (handle multi-country products)
      const primaryCountry = normalizeGeography(rawProduct.geography);
      
      // Validate and normalize category
      const normalizedCategory = normalizeCategoryName(rawProduct.category);
      
      // Build normalized product
      const normalizedProduct: LenderProduct = {
        id: rawProduct.id,
        name: rawProduct.productName,
        lenderName: rawProduct.lenderName,
        country: primaryCountry,
        category: normalizedCategory,
        minAmount: parseFloat(rawProduct.amountRange.min),
        maxAmount: parseFloat(rawProduct.amountRange.max),
        minRevenue: rawProduct.requirements?.minMonthlyRevenue 
          ? parseFloat(rawProduct.requirements.minMonthlyRevenue) 
          : 0,
        interestRateMin: rateInfo?.min,
        interestRateMax: rateInfo?.max,
        termMin: termInfo?.min,
        termMax: termInfo?.max,
        docRequirements: DOCUMENT_REQUIREMENTS_MAP[normalizedCategory] || [],
        description: rawProduct.description,
        industries: rawProduct.requirements?.industries || undefined,
      };

      // Validate against strict schema
      const validation = LenderProductSchema.safeParse(normalizedProduct);
      if (!validation.success) {
        const issues = validation.error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        );
        errors.push({
          index,
          productName: rawProduct.productName,
          issues
        });
        console.error(`❌ [NORMALIZER] Invalid product at index ${index}:`, issues);
        return;
      }

      normalizedProducts.push(validation.data);
      
    } catch (error) {
      errors.push({
        index,
        productName: rawProduct.productName,
        issues: [(error as Error).message]
      });
      console.error(`❌ [NORMALIZER] Error processing product at index ${index}:`, error);
    }
  });

  // Report results
  console.log(`✅ [NORMALIZER] Successfully normalized ${normalizedProducts.length}/${products.length} products`);
  
  if (errors.length > 0) {
    console.error(`❌ [NORMALIZER] ${errors.length} products failed validation:`);
    errors.forEach(error => {
      console.error(`  Product "${error.productName}" (index ${error.index}):`, error.issues);
    });
    
    // In development, we want to see these errors clearly
    if (process.env.NODE_ENV === 'development') {
      console.table(errors);
    }
  }

  // Fail fast if too many products are invalid
  const successRate = normalizedProducts.length / products.length;
  if (successRate < 0.8) {
    throw new Error(`Normalization success rate too low: ${Math.round(successRate * 100)}%. Staff API data quality issue.`);
  }

  return normalizedProducts;
}

/**
 * Parse interest rate from description string
 */
function parseRateFromDescription(description?: string): { min: number; max: number } | undefined {
  if (!description) return undefined;
  
  const rateMatch = description.match(/Rate: ([\d.]+)% - ([\d.]+)%/);
  if (!rateMatch) return undefined;
  
  return {
    min: parseFloat(rateMatch[1]),
    max: parseFloat(rateMatch[2])
  };
}

/**
 * Parse term information from description string
 */
function parseTermFromDescription(description?: string): { min: number; max: number } | undefined {
  if (!description) return undefined;
  
  const termMatch = description.match(/(\d+)-(\d+) months/);
  if (!termMatch) return undefined;
  
  return {
    min: parseInt(termMatch[1]),
    max: parseInt(termMatch[2])
  };
}

/**
 * Normalize geography array to single country enum value
 */
function normalizeGeography(geography: string[]): "US" | "CA" {
  if (!geography || geography.length === 0) {
    throw new Error('Missing geography information');
  }
  
  // Prioritize US if available, then CA
  if (geography.includes('US')) return 'US';
  if (geography.includes('CA')) return 'CA';
  
  throw new Error(`Unsupported geography: ${geography.join(', ')}`);
}

/**
 * Normalize category name to enum value
 */
function normalizeCategoryName(category: string): LenderProduct['category'] {
  const categoryMap: Record<string, LenderProduct['category']> = {
    'line_of_credit': 'line_of_credit',
    'term_loan': 'term_loan',
    'equipment_financing': 'equipment_financing',
    'invoice_factoring': 'invoice_factoring',
    'working_capital': 'working_capital',
    'purchase_order_financing': 'purchase_order_financing',
    'asset_based_lending': 'asset_based_lending',
    'sba_loan': 'sba_loan',
  };
  
  const normalized = categoryMap[category];
  if (!normalized) {
    throw new Error(`Unknown product category: "${category}". Staff API needs update.`);
  }
  
  return normalized;
}

/**
 * Get document requirements for a specific category
 */
export function getDocumentRequirements(category: LenderProduct['category']): string[] {
  return DOCUMENT_REQUIREMENTS_MAP[category] || [];
}

/**
 * Validation utility for development/testing
 */
export function validateSingleProduct(rawProduct: unknown): { valid: boolean; product?: LenderProduct; errors?: string[] } {
  try {
    const normalized = normalizeProducts({ success: true, products: [rawProduct], count: 1 });
    return {
      valid: normalized.length === 1,
      product: normalized[0],
    };
  } catch (error) {
    return {
      valid: false,
      errors: [(error as Error).message]
    };
  }
}