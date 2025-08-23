import { useQuery } from '@tanstack/react-query';

/**
 * ❌ DISABLED: Client cannot perform lender recommendations
 * All recommendations are processed server-side by Staff App after document review
 */

/**
 * ❌ DISABLED: Staff product fetching not allowed on client
 */
async function fetchStaffProducts(): Promise<never[]> {
  throw new Error("Staff product access restricted - recommendations handled server-side only");
}

/**
 * ❌ DISABLED: Client-side recommendations not allowed
 * Show pending status until staff processes the application
 */
export function useStaffRecommendations() {
  const query = useQuery({
    queryKey: ['staff-recommendations-disabled'],
    queryFn: async () => {
      throw new Error("Recommendations processed server-side after document review");
    },
    enabled: false, // Completely disabled
    retry: false,
  });

  return {
    ...query,
    recommendations: {
      allFilteredProducts: [],
      productsByCategory: {},
      totalMatches: 0,
      bestMatch: null,
      averageScore: 0,
      status: "pending_review",
      message: "We'll match you with lenders once your documents are reviewed."
    }
  };
}

/**
 * 🔒 SECURITY: All recommendation data conversion disabled
 */
export function convertStep1ToRecommendationData(): never {
  throw new Error("Recommendation data conversion handled server-side only");
}

/**
 * 🔒 SECURITY: Revenue conversion disabled on client
 */
export function convertRevenueToMonthly(): number {
  return 0; // No client-side revenue calculations
}