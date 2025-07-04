/**
 * Lender Products Hook with IndexedDB Caching
 * Exact implementation per user specification
 */

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { get, set } from 'idb-keyval';

export function useLenderProducts() {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['lender-products'],
    queryFn: () => fetch('/api/public/lenders').then(r => r.json()),
    refetchInterval: 5 * 60_000, // every 5 minutes
    retry: 3,
  });

  // Handle initial data loading from cache
  React.useEffect(() => {
    if (!result.data && !result.isLoading) {
      get('lender_products_cache').then(cachedData => {
        if (cachedData) {
          queryClient.setQueryData(['lender-products'], cachedData);
        }
      });
    }
  }, [result.data, result.isLoading, queryClient]);

  // Handle successful data fetching
  React.useEffect(() => {
    if (result.data && result.isSuccess) {
      set('lender_products_cache', result.data);
      set('lender_products_cache_ts', new Date().toISOString());
    }
  }, [result.data, result.isSuccess]);

  // Handle errors
  React.useEffect(() => {
    if (result.isError) {
      console.warn('API unreachable – using cached data', result.error);
    }
  }, [result.isError, result.error]);

  return result;
}