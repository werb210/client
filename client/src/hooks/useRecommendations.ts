import { useQuery } from "@tanstack/react-query";
import type { LenderProduct } from '@shared/lenderSchema';
import { getAmountRange, getRevenueMin } from "@/lib/fieldAccess";

export interface Step1FormData {
  businessLocation?: "united-states" | "canada";
  industry?: string;
  lookingFor?: "capital" | "equipment" | "both";
  fundingAmount?: string;
  useOfFunds?: string;
  lastYearRevenue?: string;
  averageMonthlyRevenue?: string;
  accountsReceivableBalance?: number; // Fixed: Use numeric field to match Step1 data
  equipmentValue?: string;
}

export function useRecommendations(formStep1Data: Step1FormData) {
  /** 1 — pull products from normalized data source (authentic data only) */
  const { data: products = [], isLoading, error } = useQuery<LenderProduct[]>({
    queryKey: ["lenderProducts"],
    queryFn: async () => {
      console.log('🔄 [PRODUCTS] Fetching from API with 22-field schema...');
      
      const res = await fetch('/api/lender-products');
      const data = await res.json();
      
      if (!data.success) {
        console.log('❌ [PRODUCTS] Failed to fetch from API');
        return [];
      }
      
      console.log(`📦 [PRODUCTS] Loaded ${data.count} products with 22-field schema`);
      return data.products;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });

  /** 2 — filter + score */
  const fundingAmount = parseFloat(formStep1Data.fundingAmount?.replace(/[^0-9.-]+/g, '') || '0');
  const revenueLastYear = getRevenueValue(formStep1Data.lastYearRevenue || '');
  const headquarters = formStep1Data.businessLocation === "united-states" ? "United States" as const : "Canada" as const;

  // Production mode: Console logging disabled

  // Debug logging: Track filtering logic and data availability
  console.log(`🔍 [STEP2] Starting with ${(products as any[]).length} authentic products for filtering`);
  console.log(`🔍 [STEP2] Filter criteria:`, { 
    headquarters, 
    fundingAmount, 
    revenueLastYear,
    lookingFor: formStep1Data.lookingFor,
    accountsReceivableBalance: formStep1Data.accountsReceivableBalance 
  });

  // Data availability analysis for transparency
  if ((products as any[]).length > 0) {
    const selectedCountryCode = headquarters === "United States" ? "US" : "CA";
    const countryProducts = (products as any[]).filter(p => p.country === selectedCountryCode || p.country === 'US/CA');
    
    if (countryProducts.length > 0) {
      const maxAmounts = countryProducts.map(p => getAmountRange(p).max).filter(max => max !== Infinity);
      const highestLimit = maxAmounts.length > 0 ? Math.max(...maxAmounts) : 0;
      
      console.log(`📊 [DATA_COVERAGE] ${selectedCountryCode} products: ${countryProducts.length}, highest limit: $${highestLimit.toLocaleString()}`);
      
      if (fundingAmount > highestLimit) {
        console.log(`⚠️ [DATA_GAP] Requested $${fundingAmount.toLocaleString()} exceeds highest available limit $${highestLimit.toLocaleString()} for ${selectedCountryCode}`);
      }
    }
  }

  const failedProducts: Array<{product: any, reason: string}> = [];
  
  // Provide data transparency when no matches found
  const selectedCountryCode = headquarters === "United States" ? "US" : "CA";
  
  const matches = (products as any[])
    .filter((p: any) => {
      // ✅ STEP 2: Country check with 22-field schema
      const targetCountry = headquarters === "United States" ? "United States" : "Canada";
      const countryMatch = p.countryOffered === targetCountry;
      if (!countryMatch) {
        failedProducts.push({product: p, reason: `Country mismatch: ${p.countryOffered} vs ${targetCountry}`});
        return false;
      }
      
          // ✅ STEP 2: Enhanced amount filtering with 22-field schema
      const amountMatch = fundingAmount >= p.minimumLendingAmount && fundingAmount <= p.maximumLendingAmount;
      
      console.log(`🔍 [AMOUNT_CHECK] ${p.productName}:`, {
        range: `$${p.minimumLendingAmount.toLocaleString()}-$${p.maximumLendingAmount.toLocaleString()}`,
        requested: `$${fundingAmount.toLocaleString()}`,
        match: amountMatch ? '✅' : '❌'
      });
      
      if (!amountMatch) {
        failedProducts.push({product: p, reason: `Amount out of range: $${p.minimumLendingAmount?.toLocaleString()}-$${p.maximumLendingAmount?.toLocaleString()} vs $${fundingAmount.toLocaleString()}`});
        return false;
      }

      // ✅ LINE OF CREDIT OVERRIDE RULE - Always include LOC if amount fits
      const isLineOfCredit = p.productCategory?.toLowerCase().includes('line of credit') || 
                            p.productCategory?.toLowerCase().includes('loc') ||
                            p.productCategory === 'Line of Credit';
      if (isLineOfCredit) {
        console.log(`🔍 [LOC_OVERRIDE] ${p.productName}: FORCE INCLUDED due to Line of Credit rule`);
        return true; // Skip all other validation for LOC products
      }

      // ✅ STEP 2: Revenue requirement check with 22-field schema
      const revenueMin = p.minimumAverageMonthlyRevenue ? p.minimumAverageMonthlyRevenue * 12 : 0; // Convert monthly to annual
      const applicantRevenue = revenueLastYear || 0;
      const revenueMatch = applicantRevenue >= revenueMin;
      if (!revenueMatch && revenueMin > 0) {
        failedProducts.push({product: p, reason: `Revenue too low: requires $${revenueMin?.toLocaleString()} vs $${applicantRevenue.toLocaleString()}`});
        return false;
      }
      
      // Enhanced debug logging for revenue filtering
      if (revenueMin > 0) {
        console.log(`🔍 [REVENUE] ${p.productName}: Required $${revenueMin.toLocaleString()}, User has $${applicantRevenue.toLocaleString()} → ${revenueMatch ? '✅' : '❌'}`);
      }
      
      // ✅ STRICT PRODUCT TYPE FILTERING - Updated for 22-field schema
      if (formStep1Data.lookingFor === "equipment") {
        // ✅ STRICT: Only Equipment Financing products allowed when "equipment" selected
        const isEquipmentProduct = isEquipmentFinancingProduct(p.productCategory);
        if (!isEquipmentProduct) {
          failedProducts.push({product: p, reason: `Excluded for Equipment Financing selection: category=${p.productCategory}`});
          console.log(`🔍 [EQUIPMENT_STRICT] ${p.productName} (${p.productCategory}): Excluded - not Equipment Financing`);
          return false;
        }
      } else if (formStep1Data.lookingFor === "capital") {
        // ✅ STRICT: Only Working Capital and LOC products allowed when "capital" selected
        const isCapitalProduct = isBusinessCapitalProduct(p.productCategory);
        if (p.productCategory?.toLowerCase().includes('working')) {
          console.log(`🔍 [CAPITAL_CHECK] "${p.productName}" (${p.productCategory}) → Capital Product: ${isCapitalProduct ? 'YES ✅' : 'NO ❌'}`);
        }
        if (!isCapitalProduct && !isLineOfCredit) {
          failedProducts.push({product: p, reason: `Excluded for Working Capital selection: category=${p.productCategory}`});
          console.log(`🔍 [CAPITAL_STRICT] ${p.productName} (${p.productCategory}): Excluded - not Working Capital or LOC`);
          return false;
        }
      } else if (formStep1Data.lookingFor === "both") {
        // ✅ HYBRID: Only hybrid-capable products (exclude pure equipment-only)
        const isCapitalProduct = isBusinessCapitalProduct(p.productCategory);
        const isEquipmentProduct = isEquipmentFinancingProduct(p.productCategory);
        
        // If it's an equipment-only product, exclude it when user wants "both"
        if (isEquipmentProduct && !isCapitalProduct) {
          failedProducts.push({product: p, reason: `Equipment-only product excluded for 'both' selection: category=${p.productCategory}`});
          console.log(`🔍 [BOTH_FILTER] ${p.productName}: Equipment-only product excluded for 'both' selection`);
          return false;
        }
        
        // Only include capital products (which can be used for equipment too) or hybrid products
        if (!isCapitalProduct) {
          failedProducts.push({product: p, reason: `Neither capital nor hybrid product: category=${p.productCategory}`});
          return false;
        }
      }
      
      // Exclude Invoice Factoring if no accounts receivable
      if (formStep1Data.accountsReceivableBalance === 0 && 
          (p.productCategory.toLowerCase().includes('invoice') || p.productCategory.toLowerCase().includes('factoring'))) {
        failedProducts.push({product: p, reason: `Invoice factoring excluded: no A/R balance`});
        return false;
      }
      
      return true;
    })
    .map((p: LenderProduct) => ({
      product: p,
      score: calculateScore(p, formStep1Data, headquarters, fundingAmount, revenueLastYear),
    }))
    .sort((a: any, b: any) => b.score - a.score);

  /** 3 — aggregate to category rows */
  const categories = matches.reduce<Record<string, { score: number; count: number; products: typeof matches }>>(
    (acc: any, m: any) => {
      const key = m.product.productCategory;
      if (!acc[key]) {
        acc[key] = { score: m.score, count: 0, products: [] };
      }
      acc[key].count += 1;
      acc[key].products.push(m);
      if (m.score > acc[key].score) acc[key].score = m.score; // keep best score
      return acc;
    },
    {}
  );

  // Debug output as requested
  console.log(`🔍 [STEP2] FINAL RESULTS:`, {
    totalProducts: products.length,
    matchedProducts: matches.length,
    categories: Object.keys(categories).length,
    categoriesFound: Object.keys(categories)
  });
  
  console.log("🔍 [STEP2] Working Capital products that passed:", 
    (matches as any[]).filter((m: any) => m.product.productCategory?.toLowerCase().includes('working')).length
  );
  
  console.log("🔍 [STEP2] Equipment-only products excluded for 'both':", 
    failedProducts.filter(f => f.reason.includes('Equipment-only')).length
  );
  
  console.log("🔍 [STEP2] Filtered out:", failedProducts.map(f => `${f.product.productName}: ${f.reason}`));

  // Data transparency: Show what authentic data is available when no matches found
  if (matches.length === 0 && (products as any[]).length > 0) {
    const countryProducts = (products as any[]).filter(p => p.country === selectedCountryCode || p.country === 'US/CA');
    
    if (countryProducts.length > 0) {
      const availableRanges = countryProducts.map(p => {
        const range = getAmountRange(p);
        return `${p.name}: $${range.min.toLocaleString()}-$${range.max === Infinity ? 'unlimited' : range.max.toLocaleString()}`;
      });
      
      console.log(`📋 [AUTHENTIC_DATA] Available ${selectedCountryCode} products and ranges:`);
      availableRanges.forEach(range => console.log(`  • ${range}`));
      
      const maxAmounts = countryProducts.map(p => getAmountRange(p).max).filter(max => max !== Infinity);
      const highestLimit = maxAmounts.length > 0 ? Math.max(...maxAmounts) : 0;
      
      if (fundingAmount > highestLimit) {
        console.log(`⚠️ [DATA_LIMITATION] Your request ($${fundingAmount.toLocaleString()}) exceeds the highest available limit ($${highestLimit.toLocaleString()}) in our authentic ${selectedCountryCode} lender database.`);
        console.log(`💡 [SUGGESTION] Consider contacting us to request access to additional lender partnerships or reducing your funding amount.`);
      }
    } else {
      console.log(`❌ [NO_DATA] No authentic ${selectedCountryCode} lender products available in current database.`);
    }
  }

  return { products: matches, categories, isLoading, error };
}

/**
 * Determines if a product category is suitable for business capital needs
 */
function isBusinessCapitalProduct(category: string): boolean {
  if (!category) return false;
  
  const capitalCategories = [
    'Working Capital',
    'Business Line of Credit', 
    'Term Loan',
    'Business Term Loan',
    'SBA Loan',
    'Asset Based Lending',
    'Invoice Factoring',
    'Purchase Order Financing'
  ];
  
  const categoryLower = category.toLowerCase();
  
  // Enhanced Working Capital detection with multiple variations
  const isWorkingCapital = categoryLower.includes('working capital') || 
                          categoryLower.includes('working_capital') ||
                          categoryLower === 'working capital';
  
  const isCapital = isWorkingCapital || capitalCategories.some(cat => 
    categoryLower.includes(cat.toLowerCase()) ||
    cat.toLowerCase().includes(categoryLower)
  );
  
  // Enhanced debug logging for all products
  if (categoryLower.includes('working') || categoryLower.includes('capital') || !isCapital) {
    console.log(`🔍 [CAPITAL_CHECK] "${category}" -> Working Capital: ${isWorkingCapital}, Is Capital: ${isCapital ? 'YES ✅' : 'NO ❌'}`);
  }
  
  return isCapital;
}

/**
 * Determines if a product category is suitable for equipment financing needs
 */
function isEquipmentFinancingProduct(category: string): boolean {
  const equipmentCategories = [
    'Equipment Financing',
    'Equipment Finance',
    'Asset-Based Lending',
    'Asset Based Lending'
  ];
  
  const isEquipment = equipmentCategories.some(cat => 
    category.toLowerCase().includes(cat.toLowerCase()) ||
    cat.toLowerCase().includes(category.toLowerCase())
  );
  
  // Enhanced debug logging for equipment products
  if (isEquipment) {
    console.log(`🔍 [EQUIPMENT_CHECK] "${category}" -> Equipment Product: YES ✅`);
  }
  
  return isEquipment;
}

function calculateScore(
  product: LenderProduct, 
  formData: Step1FormData, 
  headquarters: "United States" | "Canada",
  fundingAmount: number,
  revenueLastYear: number
): number {
  let score = 0;

  // Geography match (25 points) - Updated for 22-field schema
  const targetCountry = headquarters === "United States" ? "United States" : "Canada";
  if (product.countryOffered === targetCountry) {
    score += 25;
  }

  // Funding range match (25 points) - Updated for 22-field schema
  if (fundingAmount >= product.minimumLendingAmount && fundingAmount <= product.maximumLendingAmount) {
    score += 25;
  }

  // Industry match (25 points) - Skip for now (not in 22-field schema yet)
  // if (formData.industry && product.industries?.includes(formData.industry)) {
  //   score += 25;
  // }

  // Revenue requirement match (25 points) - Updated for 22-field schema
  if (!product.minimumAverageMonthlyRevenue || revenueLastYear >= (product.minimumAverageMonthlyRevenue * 12)) {
    score += 25;
  }

  // ✅ STEP 2: LOC products get bonus points
  if (product.productCategory.toLowerCase().includes('line of credit') || 
      product.productCategory.toLowerCase().includes('credit')) {
    score += 10;
  }

  return Math.min(score, 100);
}

function mapLookingFor(v: "capital" | "equipment" | "both"): string {
  if (v === "capital") return "working_capital";
  if (v === "equipment") return "equipment_financing";
  return "line_of_credit"; // neutral default for 'both'
}

function getRevenueValue(revenueRange: string): number {
  const ranges: { [key: string]: number } = {
    'under-100k': 50000,
    '100k-to-250k': 175000,
    '250k-to-500k': 375000,
    '500k-to-1m': 750000,
    '1m-to-5m': 3000000,
    'over-5m': 7500000
  };
  return ranges[revenueRange] || 0;
}