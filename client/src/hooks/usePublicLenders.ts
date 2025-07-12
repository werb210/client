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
      try {
        const { get } = await import('idb-keyval');
        
        // Check both cache keys for compatibility
        let products = await get('lenderProducts'); // New cache system
        if (!products || !Array.isArray(products) || products.length === 0) {
          products = await get('lender_products_cache'); // Old cache system
        }
        
        if (products && Array.isArray(products) && products.length > 0) {
          // Normalize field names for consistency
          const normalizeProductFields = (product: any) => ({
            ...product,
            minAmount: product.minAmount ?? product.amountMin ?? product.min_amount ?? product.minAmountUsd ?? product.fundingMin ?? product.loanMin ?? null,
            maxAmount: product.maxAmount ?? product.amountMax ?? product.max_amount ?? product.maxAmountUsd ?? product.fundingMax ?? product.loanMax ?? null,
          });
          
          return products.map(normalizeProductFields);
        }
        
        return [];
      } catch (error) {
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
        const { get } = await import('idb-keyval');
        
        // Check both cache keys for compatibility
        let products = await get('lenderProducts'); // New cache system
        if (!products || !Array.isArray(products) || products.length === 0) {
          products = await get('lender_products_cache'); // Old cache system
        }
        
        if (products && Array.isArray(products) && products.length > 0) {
          // Normalize field names for consistency
          const normalizeProductFields = (product: any) => ({
            ...product,
            minAmount: product.minAmount ?? product.amountMin ?? product.min_amount ?? product.minAmountUsd ?? product.fundingMin ?? product.loanMin ?? null,
            maxAmount: product.maxAmount ?? product.amountMax ?? product.max_amount ?? product.maxAmountUsd ?? product.fundingMax ?? product.loanMax ?? null,
          });
          
          const normalizedProducts = products.map(normalizeProductFields);
          
          const stats = {
            totalProducts: normalizedProducts.length,
            maxFunding: Math.max(...normalizedProducts.map(p => p.maxAmount || 0)),
            countries: Array.from(new Set(normalizedProducts.map(p => p.country).filter(Boolean))).length,
            categories: Array.from(new Set(normalizedProducts.map(p => p.category))).length
          };
          
          return stats;
        }
        
        return {
          totalProducts: 0,
          maxFunding: 0,
          countries: 0,
          categories: 0
        };
      } catch (error) {
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