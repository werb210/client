/**
 * RESTRICTED: No public access to lender products from client
 * All lender recommendations are processed server-side by Staff App
 */

import { useQuery } from "@tanstack/react-query";

/**
 * ✅ CONDITIONAL: Fetch lender products only after documents are approved
 */
export const useLenderProducts = (applicationId?: string, documentsApproved: boolean = false) => {
  return useQuery({
    queryKey: ["lender-products", applicationId],
    queryFn: async () => {
      if (!applicationId) {
        throw new Error("Application ID required");
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/lender-products?applicationId=${applicationId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_CLIENT_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch lender products");
      }

      const data = await response.json();
      return data.products || [];
    },
    enabled: documentsApproved && !!applicationId, // Only enabled after docs approved
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * ❌ DISABLED: No live WebSocket updates for lender products on client
 */
export function useLenderProductsLive() {
  // No-op - no WebSocket connection for lender data
  return;
}

/**
 * ❌ DISABLED: No direct lender product queries from client
 */
export function useLenderProductsQuery() {
  return useQuery({
    queryKey: ['lender-products-disabled'],
    queryFn: () => {
      throw new Error("Client cannot access lender products directly");
    },
    enabled: false,
    retry: false,
  });
}

/**
 * ❌ DISABLED: No category-based product filtering on client
 */
export function useLenderProductsByCategory() {
  return useQuery({
    queryKey: ['lenderProducts', 'disabled'],
    queryFn: () => {
      throw new Error("Lender product filtering restricted to Staff App");
    },
    enabled: false,
    retry: false,
  });
}

/**
 * ❌ DISABLED: No amount-based product filtering on client
 */
export function useLenderProductsByAmount() {
  return useQuery({
    queryKey: ['lenderProducts', 'amount-disabled'],
    queryFn: () => {
      throw new Error("Lender product filtering restricted to Staff App");
    },
    enabled: false,
    retry: false,
  });
}

/**
 * ❌ DISABLED: No individual lender product access on client
 */
export function useLenderProduct() {
  return useQuery({
    queryKey: ['lenderProduct', 'disabled'],
    queryFn: () => {
      throw new Error("Individual lender product access restricted to Staff App");
    },
    enabled: false,
    retry: false,
  });
}

/**
 * 🔒 SECURITY MESSAGE: Explains why lender data is restricted
 */
export const LENDER_ACCESS_MESSAGE = {
  title: "Lender Matching In Progress",
  message: "We'll match you with lenders once your documents are reviewed.",
  status: "pending_review",
  action: "Upload all required documents to proceed"
} as const;

// All product-related utilities disabled
export const V2_FIELD_MAPPING = {} as const;
export const V2_CATEGORY_OPTIONS = [] as const;

export function formatCategoryNameV2(): string {
  return "Available after document review";
}

export function matchesAmountRangeV2(): boolean {
  return false; // No client-side matching
}

export function getRequiredDocumentsV2(): string[] {
  return []; // Documents managed server-side
}

export function formatInterestRateV2(): string {
  return "Rates available after approval";
}

export function formatTermRangeV2(): string {
  return "Terms available after approval";
}

// Type exports removed - no lender product types on client
export type LenderProduct = never;
export type LenderProductsResponse = never;
export type LenderProductFilters = never;