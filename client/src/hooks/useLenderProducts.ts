/**
 * Real-time lender products hook with WebSocket live updates
 * Fetches live data from staff app with WebSocket-based synchronization
 */

import { useQuery } from "@tanstack/react-query";
import { fetchLenderProducts } from "@/lib/api";
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { LenderProductFilters, LenderProduct } from '@/api/__generated__/staff.d.ts';
import { staffClient } from '@/api/__generated__/staffClient';

/**
 * ✅ WebSocket live updates hook for lender products
 * Connects to staff backend WebSocket for real-time synchronization
 */
export function useLenderProductsLive() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const wsUrl = "wss://staff.boreal.financial";
    console.log(`🔗 Connecting to WebSocket: ${wsUrl}`);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected to staff backend');
    };
    
    ws.onmessage = (msg) => {
      try {
        const { event, payload } = JSON.parse(msg.data);
        console.log(`📢 WebSocket event received: ${event}`);

        if (event === "lenderProductsUpdated") {
          // Invalidate cache so latest products are fetched automatically
          console.log('🔄 Invalidating lender products cache...');
          queryClient.invalidateQueries({ queryKey: ["lender-products"] });
        }
        
        if (event === "fullSync") {
          // Direct cache update with full product list
          console.log('📦 Full sync - updating cache directly');
          queryClient.setQueryData(["lender-products"], payload);
        }
      } catch (error) {
        console.error('❌ WebSocket message parsing error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket connection error:', error);
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket connection closed');
    };
    
    return () => {
      console.log('🔌 Closing WebSocket connection...');
      ws.close();
    };
  }, [queryClient]);
}

export const useLenderProducts = () => {
  return useQuery({
    queryKey: ["lender-products"],
    queryFn: fetchLenderProducts,
    staleTime: 60 * 1000,
    retry: 2,
  });
};

/**
 * ✅ Legacy React Query implementation (fallback)
 * Kept for backward compatibility with existing components
 */
export function useLenderProductsQuery(filters?: LenderProductFilters) {
  const queryClient = useQueryClient();
  
  // Enable WebSocket live updates
  useLenderProductsLive();
  
  // Listen for custom events from the WebSocket handler
  useEffect(() => {
    const handleProductUpdate = (event: CustomEvent) => {
      console.log('📢 Products updated via WebSocket - refreshing cache');
      queryClient.invalidateQueries({ queryKey: ['lender-products'] });
    };

    window.addEventListener('lenderProductsUpdated', handleProductUpdate as EventListener);
    
    return () => {
      window.removeEventListener('lenderProductsUpdated', handleProductUpdate as EventListener);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['lender-products', filters],
    queryFn: async () => {
      console.log('🔄 Fetching latest lender products...');
      const response = await fetch('/api/lender-products/sync');
      if (!response.ok) {
        throw new Error(`Failed to fetch lender products: ${response.statusText}`);
      }
      const data = await response.json();
      const result = data.products || [];
      console.log(`✅ Loaded ${result.length} lender products`);
      return result;
    },
    staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute (faster refresh)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true, // Always refresh when user focuses window
    refetchOnMount: true, // Always fetch fresh data on mount
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Fetch products by category using V2 schema
 */
export function useLenderProductsByCategory(productCategory: string) {
  const filters: LenderProductFilters = { productCategory };
  
  return useQuery({
    queryKey: ['lenderProducts', 'category', productCategory],
    queryFn: () => staffClient.publicLendersList(filters),
    enabled: !!productCategory,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch products by amount range using V2 schema
 */
export function useLenderProductsByAmount(minAmount?: number, maxAmount?: number) {
  const filters: LenderProductFilters = { minAmount, maxAmount };
  
  return useQuery({
    queryKey: ['lenderProducts', 'amount', minAmount, maxAmount],
    queryFn: () => staffClient.publicLendersList(filters),
    enabled: !!(minAmount || maxAmount),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get a single lender product by ID
 */
export function useLenderProduct(id: string) {
  return useQuery({
    queryKey: ['lenderProduct', id],
    queryFn: () => staffClient.getLenderProduct(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * V2 Schema field mapping helper for migration
 */
export const V2_FIELD_MAPPING = {
  // Old field → New field
  lenderName: 'lender',
  productName: 'product', 
  category: 'productCategory',
  minAmount: 'minAmountUsd',
  maxAmount: 'maxAmountUsd',
} as const;

/**
 * Category options for V2 schema
 */
export const V2_CATEGORY_OPTIONS = [
  'Working Capital',
  'Equipment Financing', 
  'Asset-Based Lending',
  'Purchase Order Financing',
  'Invoice Factoring',
  'Business Line of Credit',
  'Term Loan',
  'SBA Loan'
] as const;

/**
 * Helper to format V2 category names for display
 */
export function formatCategoryNameV2(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Helper to check if a product matches V2 amount criteria
 */
export function matchesAmountRangeV2(product: LenderProduct, targetAmount: number): boolean {
  return targetAmount >= product.minAmountUsd && targetAmount <= product.maxAmountUsd;
}

/**
 * Helper to get document requirements from V2 schema
 */
export function getRequiredDocumentsV2(product: LenderProduct): string[] {
  return product.requiredDocs || [];
}

/**
 * Helper to format interest rate range from V2 schema
 */
export function formatInterestRateV2(product: LenderProduct): string {
  if (product.interestRateMin && product.interestRateMax) {
    return `${product.interestRateMin}% - ${product.interestRateMax}%`;
  }
  if (product.interestRateMin) {
    return `From ${product.interestRateMin}%`;
  }
  if (product.interestRateMax) {
    return `Up to ${product.interestRateMax}%`;
  }
  return 'Rate available on approval';
}

/**
 * Helper to format term range from V2 schema
 */
export function formatTermRangeV2(product: LenderProduct): string {
  if (product.termMinMonths && product.termMaxMonths) {
    return `${product.termMinMonths}-${product.termMaxMonths} months`;
  }
  if (product.termMinMonths) {
    return `From ${product.termMinMonths} months`;
  }
  if (product.termMaxMonths) {
    return `Up to ${product.termMaxMonths} months`;
  }
  return 'Terms available on approval';
}

// Export types for external use
export type { LenderProduct, LenderProductsResponse, LenderProductFilters } from '@/api/__generated__/staff.d.ts';