import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

export const LenderProduct = z.object({
  id: z.string(),
  productName: z.string(),
  lenderName: z.string(),
  category: z.string(),
  country: z.string(),
  amountRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  requirements: z.object({
    minMonthlyRevenue: z.number(),
    industries: z.array(z.string()).optional(),
  }).optional(),
  description: z.string().optional(),
});

export type LenderProduct = z.infer<typeof LenderProduct>;

export interface Step1FormData {
  businessLocation?: "united-states" | "canada";
  industry?: string;
  lookingFor?: "capital" | "equipment" | "both";
  fundingAmount?: string;
  useOfFunds?: string;
  lastYearRevenue?: string;
  averageMonthlyRevenue?: string;
  accountsReceivable?: string;
  equipmentValue?: string;
}

export function useRecommendations(formStep1Data: Step1FormData) {
  /** 1 — pull products from synced database (no fallback) */
  const { data: products = [], isLoading, error } = useQuery<LenderProduct[]>({
    queryKey: ["synced-lenders"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/lenders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch lender products: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Matched Products from Synced DB:", data);
      return data.products || data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes for synced data
    retry: 2,
  });

  /** 2 — filter + score */
  const fundingAmount = parseFloat(formStep1Data.fundingAmount?.replace(/[^0-9.-]+/g, '') || '0');
  const revenueLastYear = getRevenueValue(formStep1Data.lastYearRevenue || '');
  const headquarters = formStep1Data.businessLocation === "united-states" ? "United States" as const : "Canada" as const;

  console.log("🔍 FILTERING PRODUCTS:", {
    country: headquarters,
    lookingFor: formStep1Data.lookingFor,
    fundingAmount: formStep1Data.fundingAmount,
    industry: formStep1Data.industry,
    parsedAmount: fundingAmount
  });

  const matches = products
    .filter(p => {
      // Geography check - match country
      if (p.country !== headquarters) {
        console.log(`❌ Geography: ${p.productName} (${p.country}) doesn't match ${headquarters}`);
        return false;
      }
      
      // Amount range check
      if (fundingAmount < p.amountRange.min || fundingAmount > p.amountRange.max) {
        console.log(`❌ Amount: ${p.productName} range $${p.amountRange.min}-$${p.amountRange.max} doesn't fit $${fundingAmount}`);
        return false;
      }
      
      // Product type check for business capital - should include multiple types
      if (formStep1Data.lookingFor === "capital") {
        const isCapitalProduct = isBusinessCapitalProduct(p.category);
        if (!isCapitalProduct) {
          console.log(`❌ Product Type: ${p.productName} (${p.category}) doesn't match capital requirement`);
          return false;
        }
      }
      
      // Exclude Invoice Factoring if no accounts receivable
      if (formStep1Data.accountsReceivable === "No Account Receivables" && 
          (p.category.toLowerCase().includes('invoice') || p.category.toLowerCase().includes('factoring'))) {
        console.log(`❌ Invoice Factoring: ${p.productName} excluded because no accounts receivable`);
        return false;
      }
      
      console.log(`✅ Match: ${p.productName} by ${p.lenderName}`);
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

  console.log(`✅ FOUND ${matches.length} products across ${Object.keys(categories).length} categories`);

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

function calculateScore(
  product: LenderProduct, 
  formData: Step1FormData, 
  headquarters: "United States" | "Canada",
  fundingAmount: number,
  revenueLastYear: number
): number {
  let score = 0;

  // Geography match (25 points)
  if (product.country === headquarters) {
    score += 25;
  }

  // Funding range match (25 points)
  if (fundingAmount >= product.amountRange.min && fundingAmount <= product.amountRange.max) {
    score += 25;
  }

  // Industry match (25 points)
  if (formData.industry && product.requirements?.industries?.includes(formData.industry)) {
    score += 25;
  }

  // Revenue requirement match (25 points)  
  if (!product.requirements?.minMonthlyRevenue || revenueLastYear >= product.requirements.minMonthlyRevenue) {
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