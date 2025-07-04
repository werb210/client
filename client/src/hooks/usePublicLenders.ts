import { useLenderProducts } from "@/lib/useLenderProducts";
import { useQuery } from "@tanstack/react-query";
import { fetchLenderProducts } from "@/api/lenderProducts";

/**
 * Custom hook for fetching lender products with IndexedDB caching
 * Uses idb-keyval for persistent caching and graceful degradation
 */
export function usePublicLenders() {
  // Use the new IndexedDB caching system
  return useLenderProducts();
}

export function usePublicLenderStats() {
  return useQuery({
    queryKey: ["publicLenderStats"],
    queryFn: async () => {
      const products = await fetchLenderProducts();
      
      // Calculate stats from products
      const stats = {
        totalProducts: products.length,
        maxFunding: Math.max(...products.map(p => p.maxAmount || 0)),
        countries: Array.from(new Set(products.map(p => p.country).filter(Boolean))).length,
        categories: Array.from(new Set(products.map(p => p.category))).length
      };
      
      return stats;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });
}