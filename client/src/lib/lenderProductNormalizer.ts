import { LenderProduct } from '../types/lenderProduct';

/**
 * Normalizes raw staff API data into strict validated LenderProduct model
 * Fails fast on invalid data to surface issues immediately
 */
export function normalizeProducts(rawData: unknown): LenderProduct[] {
  // console.log('[NORMALIZER] Starting product normalization...');
  
  // Simplified validation without Zod schema dependency
  if (!rawData || typeof rawData !== 'object' || !Array.isArray((rawData as any).products)) {
    console.error('❌ [NORMALIZER] Invalid API response structure');
    throw new Error('Staff API returned invalid response structure');
  }

  const { products } = rawData as { products: any[] };
  // console.log(`[NORMALIZER] Processing ${products.length} raw products from staff API`);

  const normalizedProducts: LenderProduct[] = [];
  const errors: Array<{ index: number; productName?: string; issues: string[] }> = [];

  products.forEach((rawProduct, index) => {
    try {
      // Extract and parse rate information from description
      const rateInfo = parseRateFromDescription(rawProduct.description);
      const termInfo = parseTermFromDescription(rawProduct.description);
      
      // Use country field from staff API - it now provides correct US/CA codes
      const geography = normalizeGeographyFromCountry(rawProduct.country);
      
      // Validate and normalize category
      const normalizedCategory = normalizeCategoryName(rawProduct.category);
      
      // Build normalized product - C-1: Use name, amountMin, amountMax from API
      const normalizedProduct: LenderProduct = {
        id: rawProduct.id,
        name: rawProduct.name, // API returns 'name'
        lenderName: rawProduct.lenderName,
        geography: geography,
        country: rawProduct.country, // Preserve raw country field for filtering
        category: normalizedCategory,
        minAmount: typeof rawProduct.amountMin === 'number' 
          ? rawProduct.amountMin 
          : parseFloat(String(rawProduct.amountMin) || '0'),
        maxAmount: typeof rawProduct.amountMax === 'number' 
          ? rawProduct.amountMax 
          : parseFloat(String(rawProduct.amountMax) || '0'),
        minRevenue: rawProduct.requirements?.minMonthlyRevenue 
          ? (typeof rawProduct.requirements.minMonthlyRevenue === 'number'
             ? rawProduct.requirements.minMonthlyRevenue
             : parseFloat(rawProduct.requirements.minMonthlyRevenue))
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
          productName: rawProduct.name, // C-1: Use 'name' field from API
          issues
        });
        console.error(`❌ [NORMALIZER] Invalid product at index ${index}:`, issues);
        return;
      }

      normalizedProducts.push(validation.data);
      
    } catch (error) {
      errors.push({
        index,
        productName: rawProduct.name, // Changed from productName to name
        issues: [(error as Error).message]
      });
      console.error(`❌ [NORMALIZER] Error processing product at index ${index}:`, error);
    }
  });

  // Report results
  // console.log(`✅ [NORMALIZER] Successfully normalized ${normalizedProducts.length}/${products.length} products`);
  
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
 * Convert staff API country codes to geography array
 */
function normalizeGeographyFromCountry(country?: string): ("US" | "CA")[] {
  if (!country) {
    // // console.log('[NORMALIZER] No country provided, defaulting to US');
    return ['US'];
  }
  
  // Handle multi-country products
  if (country === 'US/CA' || country === 'CA/US') {
    return ['US', 'CA'];
  }
  
  // Single country products
  if (country === 'US') {
    return ['US'];
  }
  
  if (country === 'CA') {
    return ['CA'];
  }
  
  // Fallback for unknown country codes
  // // console.log(`[NORMALIZER] Unknown country code: ${country}, defaulting to US`);
  return ['US'];
}

/**
 * Legacy normalize geography array - assign products to appropriate markets
 * DEPRECATED: Now using normalizeGeographyFromCountry for staff API country field
 */
function normalizeGeography(geography?: string[], lenderName?: string, productId?: string): ("US" | "CA")[] {
  if (!geography || geography.length === 0) {
    // Staff API doesn't provide geography - use intelligent assignment
    // Assign products to both US and CA for better coverage
    
    // Canadian lenders (based on common bank names)
    const canadianLenders = [
      'RBC', 'Royal Bank', 'TD Bank', 'BMO', 'Bank of Montreal', 
      'Scotia', 'CIBC', 'Canadian Imperial', 'BDC', 'Export Development'
    ];
    
    // Check if lender name suggests Canadian origin
    if (lenderName && canadianLenders.some(ca => lenderName.includes(ca))) {
      // // console.log(`[NORMALIZER] Assigning ${lenderName} to CA based on lender name`);
      return ['CA'];
    }
    
    // Distribute remaining products: assign every 3rd product to CA for geographic diversity
    if (productId) {
      const idHash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      if (idHash % 3 === 0) {
        // console.log(`[NORMALIZER] Assigning product ${productId} to CA for geographic diversity`);
        return ['CA'];
      }
    }
    
    // Default to US
    // console.log('[NORMALIZER] Geography missing, defaulting to US');
    return ['US'];
  }
  
  // Return valid geography array
  const validGeography = geography.filter((g): g is 'US' | 'CA' => g === 'US' || g === 'CA');
  if (validGeography.length > 0) {
    return validGeography;
  }
  
  // If geography provided but not US/CA, default to US
  // console.log(`[NORMALIZER] Unsupported geography ${geography.join(', ')}, defaulting to US`);
  return ['US'];
}

/**
 * Normalize category name to enum value
 */
function normalizeCategoryName(category: string): LenderProduct['category'] {
  const categoryMap: Record<string, LenderProduct['category']> = {
    // Staff API format -> Internal enum format
    'Purchase Order Financing': 'purchase_order_financing',
    'Business Line of Credit': 'line_of_credit',
    'Invoice Factoring': 'invoice_factoring',
    'Equipment Financing': 'equipment_financing',
    'Term Loan': 'term_loan',
    'Working Capital': 'working_capital',
    'Asset-Based Lending': 'asset_based_lending',
    'SBA Loan': 'sba_loan',
    // Fallback mappings for underscore format
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
    // If exact match fails, try to map common variations
    const lowercaseCategory = category.toLowerCase();
    if (lowercaseCategory.includes('line of credit')) return 'line_of_credit';
    if (lowercaseCategory.includes('term loan')) return 'term_loan';
    if (lowercaseCategory.includes('equipment')) return 'equipment_financing';
    if (lowercaseCategory.includes('factoring')) return 'invoice_factoring';
    if (lowercaseCategory.includes('working capital')) return 'working_capital';
    if (lowercaseCategory.includes('purchase order')) return 'purchase_order_financing';
    if (lowercaseCategory.includes('asset')) return 'asset_based_lending';
    if (lowercaseCategory.includes('sba')) return 'sba_loan';
    
    console.warn(`[NORMALIZER] Unknown category "${category}", defaulting to working_capital`);
    return 'working_capital';
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