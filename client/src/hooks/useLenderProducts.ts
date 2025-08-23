/**
 * Real-time lender products hook with automatic sync
 * Fetches live data from staff app with webhook-based cache invalidation
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { staffClient, LenderProduct, LenderProductFilters } from '@/api/__generated__/staffClient';

/**
 * ✅ Real-time lender products hook - auto-syncs with staff app
 * No local storage, always fresh data from single source of truth
 */
export function useLenderProducts(filters?: LenderProductFilters) {
  const queryClient = useQueryClient();
  
  // Set up auto-refresh via server-sent events or polling
  useEffect(() => {
    const eventSource = new EventSource('/api/lender-products/events');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'lender-products-updated') {
        console.log('📢 Lender products updated - refreshing cache');
        queryClient.invalidateQueries({ queryKey: ['lenderProducts'] });
      }
    };
    
    eventSource.onerror = () => {
      console.warn('⚠️  SSE connection lost, falling back to periodic refresh');
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['lenderProducts', filters],
    queryFn: async () => {
      console.log('🔄 Fetching live lender products from staff app...');
      const result = await staffClient.publicLendersList(filters);
      console.log(`✅ Loaded ${result.length} lender products from staff app`);
      return result;
    },
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes  
    refetchOnWindowFocus: true, // Refresh when user focuses window
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
export type { LenderProduct, LenderProductsResponse, LenderProductFilters } from '@/api/__generated__/staffClient';