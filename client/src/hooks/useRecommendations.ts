import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

export const LenderProduct = z.object({
  id: z.string(),
  product_name: z.string(),
  lender_name: z.string(),
  product_type: z.enum([
    "equipment_financing",
    "invoice_factoring", 
    "line_of_credit",
    "working_capital",
    "term_loan",
    "purchase_order_financing",
  ]),
  geography: z.array(z.enum(["US", "CA"])),
  min_amount: z.number(),
  max_amount: z.number(),
  min_revenue: z.number().nullable(),
  industries: z.array(z.string()).nullable(),
  is_active: z.boolean().optional(),
  description: z.string().optional(),
  video_url: z.string().optional(),
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
  /** 1 — pull products twice a day (12 h) */
  const { data: products = [], isLoading, error } = useQuery<LenderProduct[]>({
    queryKey: ["lenders"],
    queryFn: async () => {
      const res = await fetch("https://staffportal.replit.app/api/public/lenders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch lender products`);
      }
      
      const data = await res.json();
      return data.products || [];
    },
    staleTime: 1000 * 60 * 60 * 12,
    retry: 2,
  });

  /** 2 — filter + score */
  const fundingAmount = parseFloat(formStep1Data.fundingAmount?.replace(/[^0-9.-]+/g, '') || '0');
  const revenueLastYear = getRevenueValue(formStep1Data.lastYearRevenue || '');
  const headquarters = formStep1Data.businessLocation === "united-states" ? "US" as const : "CA" as const;

  const matches = products
    .filter(p => {
      // Basic active check
      if (p.is_active === false) return false;
      
      // Geography check
      if (!p.geography.includes(headquarters)) return false;
      
      // Amount range check
      if (fundingAmount < p.min_amount || fundingAmount > p.max_amount) return false;
      
      // Revenue requirement check
      if (p.min_revenue && revenueLastYear < p.min_revenue) return false;
      
      // Industry check (if specified)
      if (p.industries?.length && formStep1Data.industry && !p.industries.includes(formStep1Data.industry)) return false;
      
      // Product type check
      if (formStep1Data.lookingFor && formStep1Data.lookingFor !== "both") {
        const mappedType = mapLookingFor(formStep1Data.lookingFor);
        if (mappedType !== p.product_type) return false;
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
      const key = m.product.product_type;
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

  return { products: matches, categories, isLoading, error };
}

function calculateScore(
  product: LenderProduct, 
  formData: Step1FormData, 
  headquarters: "US" | "CA",
  fundingAmount: number,
  revenueLastYear: number
): number {
  let score = 0;

  // Geography match (25 points)
  if (product.geography.includes(headquarters)) {
    score += 25;
  }

  // Funding range match (25 points)
  if (fundingAmount >= product.min_amount && fundingAmount <= product.max_amount) {
    score += 25;
  }

  // Industry match (25 points)
  if (formData.industry && product.industries?.includes(formData.industry)) {
    score += 25;
  }

  // Revenue requirement match (25 points)
  if (!product.min_revenue || revenueLastYear >= product.min_revenue) {
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