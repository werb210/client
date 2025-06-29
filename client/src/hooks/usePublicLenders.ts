import { useQuery } from "@tanstack/react-query";

interface LenderProduct {
  id: string;
  productType: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  description: string;
  lenderName: string;
  country?: string;
  industry?: string;
  qualifications?: string[];
  processingTime?: string;
}

export function usePublicLenders() {
  return useQuery({
    queryKey: ["publicLenders"],
    queryFn: async () => {
      const res = await fetch(
        "https://staffportal.replit.app/api/public/lenders",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to fetch lender products`);
      }
      
      const data = await res.json();
      return data.products as LenderProduct[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export type { LenderProduct };