/**
 * Reliable Lender Products Hook
 * Implements CLIENT INSTRUCTIONS for reliable data fetching with fallback
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { reliableLenderSync, pullLiveData, getSyncStatus } from '@/lib/reliableLenderSync';

interface UseReliableLenderProductsResult {
  data: any[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  warning?: string;
  source: 'staff_api' | 'cached_data' | 'fallback_data';
  productCount: number;
  refetch: () => void;
  forceSync: () => Promise<void>;
  syncStatus: any;
}

export function useReliableLenderProducts(): UseReliableLenderProductsResult {
  const [warning, setWarning] = useState<string | undefined>();
  const [source, setSource] = useState<'staff_api' | 'cached_data' | 'fallback_data'>('fallback_data');
  const [productCount, setProductCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<any>(null);

  // Main query for lender products
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['reliable-lender-products'],
    queryFn: async () => {
      // console.log('[HOOK] Fetching lender products using reliable sync...');
      
      const result = await pullLiveData();
      
      // Update UI state based on sync result
      setWarning(result.warning);
      setSource(result.source);
      setProductCount(result.productCount);
      
      // 5. Log or Alert on API Incompatibility
      if (result.source === 'fallback_data' || result.source === 'cached_data') {
        console.warn('⚠️ Staff API returned 0 products. Falling back to cache.');
      }
      
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes as per CLIENT INSTRUCTIONS
    refetchInterval: false, // DISABLED: Prevent automatic polling causing promise rejections
    refetchOnWindowFocus: false, // DISABLED: Prevent refetch on focus
    refetchOnMount: false, // DISABLED: Only fetch when explicitly requested
    retry: 1, // Only retry once for API failures
  });

  // Load sync status on mount and periodically
  useEffect(() => {
    const loadSyncStatus = async () => {
      const status = await getSyncStatus();
      setSyncStatus(status);
    };
    
    loadSyncStatus();
    // DISABLED: 30-second interval polling causing promise rejections
    // const interval = setInterval(loadSyncStatus, 30000);
    // return () => clearInterval(interval);
  }, []);

  // Force sync function for manual refresh
  const handleForceSync = async () => {
    try {
      // console.log('[HOOK] Force sync triggered');
      const result = await reliableLenderSync.forcSync();
      
      setWarning(result.warning);
      setSource(result.source);
      setProductCount(result.productCount);
      
      // Refetch the query to update UI
      refetch();
    } catch (error) {
      console.error('[HOOK] Force sync failed:', error);
    }
  };

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    warning,
    source,
    productCount,
    refetch,
    forceSync: handleForceSync,
    syncStatus
  };
}