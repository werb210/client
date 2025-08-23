import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

/**
 * ✅ ENABLED: Application status polling hook
 * Polls application status instead of fetching lender products
 */
export const useApplicationStatus = (appId?: string) => {
  return useQuery({
    queryKey: ["applicationStatus", appId],
    queryFn: async () => {
      if (!appId) {
        throw new Error("Application ID required");
      }
      
      const response = await apiFetch(`/applications/${appId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch application status");
      }
      
      return response.json();
    },
    enabled: !!appId,
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });
};