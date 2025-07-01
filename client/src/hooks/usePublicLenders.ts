import { useQuery } from "@tanstack/react-query";
import { fetchLenderProducts } from "@/api/lenderProducts";

/**
 * Custom hook for fetching lender products with intelligent fallback
 * - Development: Uses local API endpoints for testing
 * - Production: Fetches from staff app public CORS-enabled API
 */
export function usePublicLenders() {
  return useQuery({
    queryKey: ["publicLenderProducts"],
    queryFn: fetchLenderProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function usePublicLenderStats() {
  return useQuery({
    queryKey: ["publicLenderStats"],
    queryFn: async () => {
      const { fetchLenderStats } = await import("@/api/lenderProducts");
      return fetchLenderStats();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });
}