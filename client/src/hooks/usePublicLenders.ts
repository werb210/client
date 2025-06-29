import { useQuery } from "@tanstack/react-query";

interface LenderProduct {
  id: string;
  product_name: string;
  lender_name: string;
  product_type: string;
  geography: string[];
  min_amount: number;
  max_amount: number;
  min_revenue?: number;
  industries?: string[];
  video_url?: string;
  description?: string;
}

interface LenderProductsResponse {
  products: LenderProduct[];
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
      
      const data: LenderProductsResponse = await res.json();
      return data.products;
    },
    staleTime: 12 * 60 * 60 * 1000, // 12 hours for caching
    retry: 2,
  });
}

export type { LenderProduct, LenderProductsResponse };