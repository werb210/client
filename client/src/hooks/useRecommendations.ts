import { useQuery } from "@tanstack/react-query";
import type { LenderProduct } from '@shared/lenderProductSchema';

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
  /** 1 — pull products from normalized data source */
  const { data: products = [], isLoading, error } = useQuery<LenderProduct[]>({
    queryKey: ["normalized-lenders-cache-only"],
    queryFn: async () => {
      try {
        const { loadLenderProducts } = await import('../utils/lenderCache');
        const cached = await loadLenderProducts();
        return cached || [];
      } catch (error) {
        return [];
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

  const matches = products
    .filter((p: LenderProduct) => {
      // Country check - exact match or multi-country (US/CA)
      const selectedCountryCode = headquarters === "United States" ? "US" : "CA";
      if (!(p.country === selectedCountryCode || p.country === 'US/CA')) {
        return false;
      }
      
      // Amount range check
      if (fundingAmount < p.minAmount || fundingAmount > p.maxAmount) {
        return false;
      }
      
      // Product type check based on what user is looking for
      if (formStep1Data.lookingFor === "capital") {
        const isCapitalProduct = isBusinessCapitalProduct(p.category);
        if (!isCapitalProduct) {
          return false;
        }
      } else if (formStep1Data.lookingFor === "equipment") {
        const isEquipmentProduct = isEquipmentFinancingProduct(p.category);
        if (!isEquipmentProduct) {
          return false;
        }
      } else if (formStep1Data.lookingFor === "both") {
        // For "both", include both capital and equipment financing products
        const isCapitalProduct = isBusinessCapitalProduct(p.category);
        const isEquipmentProduct = isEquipmentFinancingProduct(p.category);
        if (!isCapitalProduct && !isEquipmentProduct) {
          return false;
        }
      }
      
      // Exclude Invoice Factoring if no accounts receivable
      // Fix: Use accountsReceivableBalance (numeric) instead of accountsReceivable (string)
      if (formStep1Data.accountsReceivableBalance === 0 && 
          (p.category.toLowerCase().includes('invoice') || p.category.toLowerCase().includes('factoring'))) {
        return false;
      }
      
      return true;
    })
    .map(p => ({
      product: p,
      score: calculateScore(p, formStep1Data, headquarters, fundingAmount, revenueLastYear),
    }))
    .sort((a, b) => b.score - a.score);

  /** 3 — aggregate to category rows */
  const categories = matches.reduce<Record<string, { score: number; count: number; products: typeof matches }>>(
    (acc, m) => {
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

  // Production mode: Console logging disabled

  return { products: matches, categories, isLoading, error };
}

/**
 * Determines if a product category is suitable for business capital needs
 */
function isBusinessCapitalProduct(category: string): boolean {
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
  
  return capitalCategories.some(cat => 
    category.toLowerCase().includes(cat.toLowerCase()) ||
    cat.toLowerCase().includes(category.toLowerCase())
  );
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
  
  return equipmentCategories.some(cat => 
    category.toLowerCase().includes(cat.toLowerCase()) ||
    cat.toLowerCase().includes(category.toLowerCase())
  );
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