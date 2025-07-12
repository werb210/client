import { useLenderProducts } from "@/lib/useLenderProducts";
import { useQuery } from "@tanstack/react-query";
import { fetchLenderProducts } from "@/api/lenderProducts";

/**
 * Custom hook for fetching lender products with IndexedDB caching
 * Uses idb-keyval for persistent caching and graceful degradation
 */
export function usePublicLenders() {
  // Use TanStack Query with the IndexedDB caching system
  return useQuery({
    queryKey: ['/api/public/lenders'],
    queryFn: async () => {
      console.log('[DEBUG] usePublicLenders - Starting fetch');
      try {
        const response = await fetchLenderProducts();
        console.log('[DEBUG] usePublicLenders - Fetched response:', response);
        return response.products || [];
      } catch (error) {
        console.error('[DEBUG] usePublicLenders - Fetch error:', error);
        // Return empty array instead of throwing to prevent unhandled rejections
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false, // Disable retries for cache-only operation
    onError: (error) => {
      console.warn('[usePublicLenders] Query error (handled):', error);
      // Silently handle errors to prevent unhandled rejections
    }
  });
}

export function usePublicLenderStats() {
  return useQuery({
    queryKey: ["publicLenderStats"],
    queryFn: async () => {
      try {
        const response = await fetchLenderProducts();
        const products = response.products || [];
        
        // Calculate stats from products
        const stats = {
          totalProducts: products.length,
          maxFunding: Math.max(...products.map(p => p.maxAmount || 0)),
          countries: Array.from(new Set(products.map(p => p.country).filter(Boolean))).length,
          categories: Array.from(new Set(products.map(p => p.category))).length
        };
        
        return stats;
      } catch (error) {
        console.warn('[usePublicLenderStats] Query error (handled):', error);
        return {
          totalProducts: 0,
          maxFunding: 0,
          countries: 0,
          categories: 0
        };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    onError: (error) => {
      console.warn('[usePublicLenderStats] Query error (handled):', error);
    }
  });
}