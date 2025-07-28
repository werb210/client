import { useQuery } from "@tanstack/react-query";
import type { LenderProduct } from '@shared/lenderProductSchema';
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
  /** 1 — pull products from normalized data source with fallback support */
  const { data: products = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["normalized-lenders-cache-with-fallback"],
    queryFn: async () => {
      try {
        const { loadLenderProducts } = await import('../utils/lenderCache');
        let cached = await loadLenderProducts();
        
        // If no cached products, use mock data
        if (!cached || cached.length === 0) {
          console.log('🔄 [PRODUCTS] No cached products, using mock data');
          const { mockLenderProducts } = await import('../data/mockLenderProducts');
          return mockLenderProducts;
        }
        
        // Check if cached products have sufficient coverage for high amounts
        const fundingAmount = parseFloat(formStep1Data.fundingAmount?.replace(/[^0-9.-]+/g, '') || '0');
        const selectedCountry = formStep1Data.businessLocation === "united-states" ? "US" : "CA";
        
        // Find products that can cover the requested amount in the selected country
        const suitableProducts = cached.filter(p => {
          const countryMatch = p.country === selectedCountry || p.country === 'US/CA';
          if (!countryMatch) return false;
          
          const { min, max } = getAmountRange(p);
          return fundingAmount >= min && fundingAmount <= max;
        });
        
        // If no suitable products found for the amount/country, supplement with mock data
        if (suitableProducts.length === 0 && fundingAmount > 0) {
          console.log(`🔄 [PRODUCTS] No cached products suitable for ${selectedCountry} $${fundingAmount.toLocaleString()}, adding mock data`);
          const { mockLenderProducts } = await import('../data/mockLenderProducts');
          
          // Filter mock products for the requested country and add them
          const mockCountryProducts = mockLenderProducts.filter(p => 
            p.country === 'Canada' && selectedCountry === 'CA' ||
            p.country === 'USA' && selectedCountry === 'US'
          );
          
          console.log(`🔄 [PRODUCTS] Adding ${mockCountryProducts.length} mock ${selectedCountry} products to supplement coverage`);
          return [...cached, ...mockCountryProducts];
        }
        
        return cached;
      } catch (error) {
        console.error('❌ [PRODUCTS] Error loading products, using mock fallback:', error);
        const { mockLenderProducts } = await import('../data/mockLenderProducts');
        return mockLenderProducts;
      }
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false
  });

  /** 2 — filter + score */
  const fundingAmount = parseFloat(formStep1Data.fundingAmount?.replace(/[^0-9.-]+/g, '') || '0');
  const revenueLastYear = getRevenueValue(formStep1Data.lastYearRevenue || '');
  const headquarters = formStep1Data.businessLocation === "united-states" ? "United States" as const : "Canada" as const;

  // Production mode: Console logging disabled

  // Debug logging: Track filtering logic
  console.log(`🔍 [STEP2] Starting with ${(products as any[]).length} products for filtering`);
  console.log(`🔍 [STEP2] Filter criteria:`, { 
    headquarters, 
    fundingAmount, 
    revenueLastYear,
    lookingFor: formStep1Data.lookingFor,
    accountsReceivableBalance: formStep1Data.accountsReceivableBalance 
  });

  const failedProducts: Array<{product: any, reason: string}> = [];
  
  const matches = (products as any[])
    .filter((p: any) => {
      // Country check - exact match or multi-country (US/CA)
      const selectedCountryCode = headquarters === "United States" ? "US" : "CA";
      const countryMatch = p.country === selectedCountryCode || p.country === 'US/CA';
      if (!countryMatch) {
        failedProducts.push({product: p, reason: `Country mismatch: ${p.country} vs ${selectedCountryCode}`});
        return false;
      }
      
      // Amount range check - ENHANCED DEBUG: Show all amount fields
      const { min, max } = getAmountRange(p);
      const amountMatch = fundingAmount >= min && fundingAmount <= max;
      
      // ENHANCED DEBUG: Show all possible amount fields to debug parsing issues
      console.log(`🔍 [AMOUNT_DEBUG] ${p.name}:`, {
        raw_fields: {
          amount_min: p.amount_min,
          amount_max: p.amount_max,
          amountMin: p.amountMin,
          amountMax: p.amountMax,
          fundingMin: p.fundingMin,
          fundingMax: p.fundingMax,
          minAmount: p.minAmount,
          maxAmount: p.maxAmount,
          min_amount: p.min_amount,
          max_amount: p.max_amount
        },
        parsed: { min, max },
        fundingAmount,
        amountMatch
      });
      
      if (!amountMatch) {
        failedProducts.push({product: p, reason: `Amount out of range: $${min?.toLocaleString()}-$${max === Infinity ? 'unlimited' : max?.toLocaleString()} vs $${fundingAmount.toLocaleString()}`});
        return false;
      }

      // ✅ LINE OF CREDIT OVERRIDE RULE - Always include LOC if amount fits
      const isLineOfCredit = p.category?.toLowerCase().includes('line of credit') || 
                            p.category?.toLowerCase().includes('loc') ||
                            p.category === 'Business Line of Credit';
      if (isLineOfCredit) {
        console.log(`🔍 [LOC_OVERRIDE] ${p.name}: FORCE INCLUDED due to Line of Credit rule`);
        return true; // Skip all other validation for LOC products
      }

      // Revenue requirement check - NEW: Add revenue filtering
      const revenueMin = getRevenueMin(p);
      const applicantRevenue = revenueLastYear || 0;
      const revenueMatch = applicantRevenue >= revenueMin;
      if (!revenueMatch) {
        failedProducts.push({product: p, reason: `Revenue too low: requires $${revenueMin?.toLocaleString()} vs $${applicantRevenue.toLocaleString()}`});
        return false;
      }
      
      // Enhanced debug logging for revenue filtering
      if (revenueMin > 0) {
        console.log(`🔍 [REVENUE] ${p.name}: Required $${revenueMin.toLocaleString()}, User has $${applicantRevenue.toLocaleString()} → ${revenueMatch ? '✅' : '❌'}`);
      }
      
      // ✅ STRICT PRODUCT TYPE FILTERING - Fixed per user requirements
      if (formStep1Data.lookingFor === "equipment") {
        // ✅ STRICT: Only Equipment Financing products allowed when "equipment" selected
        const isEquipmentProduct = isEquipmentFinancingProduct(p.category);
        if (!isEquipmentProduct) {
          failedProducts.push({product: p, reason: `Excluded for Equipment Financing selection: category=${p.category}`});
          console.log(`🔍 [EQUIPMENT_STRICT] ${p.name} (${p.category}): Excluded - not Equipment Financing`);
          return false;
        }
      } else if (formStep1Data.lookingFor === "capital") {
        // ✅ STRICT: Only Working Capital and LOC products allowed when "capital" selected
        const isCapitalProduct = isBusinessCapitalProduct(p.category);
        if (p.category?.toLowerCase().includes('working')) {
          console.log(`🔍 [CAPITAL_CHECK] "${p.name}" (${p.category}) → Capital Product: ${isCapitalProduct ? 'YES ✅' : 'NO ❌'}`);
        }
        if (!isCapitalProduct && !isLineOfCredit) {
          failedProducts.push({product: p, reason: `Excluded for Working Capital selection: category=${p.category}`});
          console.log(`🔍 [CAPITAL_STRICT] ${p.name} (${p.category}): Excluded - not Working Capital or LOC`);
          return false;
        }
      } else if (formStep1Data.lookingFor === "both") {
        // ✅ HYBRID: Only hybrid-capable products (exclude pure equipment-only)
        const isCapitalProduct = isBusinessCapitalProduct(p.category);
        const isEquipmentProduct = isEquipmentFinancingProduct(p.category);
        
        // If it's an equipment-only product, exclude it when user wants "both"
        if (isEquipmentProduct && !isCapitalProduct) {
          failedProducts.push({product: p, reason: `Equipment-only product excluded for 'both' selection: category=${p.category}`});
          console.log(`🔍 [BOTH_FILTER] ${p.name}: Equipment-only product excluded for 'both' selection`);
          return false;
        }
        
        // Only include capital products (which can be used for equipment too) or hybrid products
        if (!isCapitalProduct) {
          failedProducts.push({product: p, reason: `Neither capital nor hybrid product: category=${p.category}`});
          return false;
        }
      }
      
      // Exclude Invoice Factoring if no accounts receivable
      // Fix: Use accountsReceivableBalance (numeric) instead of accountsReceivable (string)
      if (formStep1Data.accountsReceivableBalance === 0 && 
          (p.category.toLowerCase().includes('invoice') || p.category.toLowerCase().includes('factoring'))) {
        failedProducts.push({product: p, reason: `Invoice factoring excluded: no A/R balance`});
        return false;
      }
      
      return true;
    })
    .map((p: any) => ({
      product: p,
      score: calculateScore(p, formStep1Data, headquarters, fundingAmount, revenueLastYear),
    }))
    .sort((a: any, b: any) => b.score - a.score);

  /** 3 — aggregate to category rows */
  const categories = matches.reduce<Record<string, { score: number; count: number; products: typeof matches }>>(
    (acc: any, m: any) => {
      const key = m.product.category;
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
    (matches as any[]).filter((m: any) => m.product.category?.toLowerCase().includes('working')).length
  );
  
  console.log("🔍 [STEP2] Equipment-only products excluded for 'both':", 
    failedProducts.filter(f => f.reason.includes('Equipment-only')).length
  );
  
  console.log("🔍 [STEP2] Filtered out:", failedProducts.map(f => `${f.product.name}: ${f.reason}`));

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

  // Geography match (25 points)
  const targetCountry = headquarters === "United States" ? "US" : "CA";
  if (product.geography.includes(targetCountry)) {
    score += 25;
  }

  // Funding range match (25 points)
  if (fundingAmount >= product.minAmount && fundingAmount <= product.maxAmount) {
    score += 25;
  }

  // Industry match (25 points)
  if (formData.industry && product.industries?.includes(formData.industry)) {
    score += 25;
  }

  // Revenue requirement match (25 points)  
  if (!product.minRevenue || revenueLastYear >= product.minRevenue) {
    score += 25;
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