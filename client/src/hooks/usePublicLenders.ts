import { useQuery } from "@tanstack/react-query";
import { getCachedLenderProducts, syncLenderProducts, getCacheMetadata } from '@/lib/syncLenderProducts';

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
      // Get cached data immediately (offline-safe)
      const cachedProducts = await getCachedLenderProducts();
      
      // Check cache freshness and sync in background if stale
      const metadata = await getCacheMetadata();
      if (metadata?.isStale) {
        // Background sync without blocking the query
        syncLenderProducts().catch(error => {
          console.error('Background sync failed:', error);
        });
      }
      
      return cachedProducts;
    },
    staleTime: 12 * 60 * 60 * 1000, // 12 hours for caching
    retry: 2,
    // Return cached data immediately, even if stale
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export type { LenderProduct, LenderProductsResponse };