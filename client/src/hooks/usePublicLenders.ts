import { useQuery } from "@tanstack/react-query";
import { LenderProduct, LenderProductsResponse } from "@/types/lenderProducts";

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

export { LenderProduct, LenderProductsResponse } from "@/types/lenderProducts";