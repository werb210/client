import { useLenderProducts } from "@/lib/useLenderProducts";
import { useQuery } from "@tanstack/react-query";
import { fetchLenderProducts } from "@/api/lenderProducts";

/**
 * Custom hook for fetching lender products with IndexedDB caching
 * Uses idb-keyval for persistent caching and graceful degradation
 */
export function usePublicLenders() {
  // Use TanStack Query with the IndexedDB caching system
  // CACHE-ONLY SYSTEM: Return static data from IndexedDB cache only
  return useQuery({
    queryKey: ['cache-only-lenders'],
    queryFn: async () => {
      console.log('[DEBUG] usePublicLenders - CACHE-ONLY mode');
      try {
        // Only read from IndexedDB cache, no API calls
        const { loadLenderProducts } = await import('../utils/lenderCache');
        const cached = await loadLenderProducts();
        console.log(`[DEBUG] usePublicLenders - Cache returned ${cached?.length || 0} products`);
        return cached || [];
      } catch (error) {
        console.warn('[usePublicLenders] Cache read failed:', error);
        return [];
      }
    },
    staleTime: Infinity, // Never refetch in cache-only mode
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
}

export function usePublicLenderStats() {
  return useQuery({
    queryKey: ["cache-only-lender-stats"],
    queryFn: async () => {
      try {
        // Only read from IndexedDB cache, no API calls
        const { loadLenderProducts } = await import('../utils/lenderCache');
        const products = (await loadLenderProducts()) || [];
        
        // Calculate stats from products
        const stats = {
          totalProducts: products.length,
          maxFunding: Math.max(...products.map(p => p.maxAmount || 0)),
          countries: Array.from(new Set(products.map(p => p.country).filter(Boolean))).length,
          categories: Array.from(new Set(products.map(p => p.category))).length
        };
        
        return stats;
      } catch (error) {
        console.warn('[usePublicLenderStats] Cache read failed:', error);
        return {
          totalProducts: 0,
          maxFunding: 0,
          countries: 0,
          categories: 0
        };
      }
    },
    staleTime: Infinity, // Never refetch in cache-only mode
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
}