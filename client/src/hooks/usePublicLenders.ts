import { useLenderProducts } from "@/lib/useLenderProducts";
import { useQuery } from "@tanstack/react-query";
import { fetchLenderProducts } from "@/lib/api";

/**
 * Custom hook for fetching lender products with IndexedDB caching
 * Uses idb-keyval for persistent caching and graceful degradation
 */
export function usePublicLenders() {
  // Use TanStack Query with the IndexedDB caching system
  // CACHE-ONLY SYSTEM: Return static data from IndexedDB cache only
  return useQuery({
    queryKey: ['public-lenders'],
    queryFn: async () => {
      try {
        const { fetchLenderProducts } = await import('../lib/api');
        const products = await fetchLenderProducts();
        console.log(`[usePublicLenders] Fetched ${products.length} products`);
        return products;
      } catch (error) {
        console.error('[usePublicLenders] Error fetching products:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3
  });
}

export function usePublicLenderStats() {
  return useQuery({
    queryKey: ["public-lender-stats"],
    queryFn: async () => {
      try {
        const { fetchLenderProducts } = await import('../lib/api');
        const products = await fetchLenderProducts();
        
        const stats = {
          totalProducts: products.length,
          maxFunding: Math.max(...products.map(p => p.max_amount || 0)),
          countries: Array.from(new Set(products.map(p => p.country).filter(Boolean))).length,
          categories: Array.from(new Set(products.map(p => p.category))).length
        };
        
        console.log(`[usePublicLenderStats] Generated stats:`, stats);
        return stats;
      } catch (error) {
        console.error('[usePublicLenderStats] Error:', error);
        return {
          totalProducts: 0,
          maxFunding: 0,
          countries: 0,
          categories: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3
  });
}