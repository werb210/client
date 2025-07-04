/**
 * Lender Products Hook with Production-Ready Sync System
 * Implements robust caching, retry logic, and data preservation
 */

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syncLenderProducts, initializeSyncSystem, getSyncStatus } from './lenderProductSync';
import { toast } from '@/hooks/use-toast';

export function useLenderProducts() {
  const queryClient = useQueryClient();
  const [syncInitialized, setSyncInitialized] = React.useState(false);

  const result = useQuery({
    queryKey: ['lender-products'],
    queryFn: async () => {
      const syncResult = await syncLenderProducts();
      
      if (syncResult.error && syncResult.fromCache) {
        toast({
          title: 'Using Cached Data',
          description: syncResult.error,
          variant: 'default'
        });
      }
      
      return syncResult.data;
    },
    refetchInterval: false, // Use our custom sync scheduler instead
    retry: false, // Handle retries in sync system
    staleTime: Infinity, // Data is managed by sync system
  });

  // Initialize sync system on mount
  React.useEffect(() => {
    if (!syncInitialized) {
      initializeSyncSystem().then((initialResult) => {
        setSyncInitialized(true);
        
        // Set initial data if not already loaded
        if (initialResult.data && !result.data) {
          queryClient.setQueryData(['lender-products'], initialResult.data);
        }
        
        if (initialResult.error) {
          console.warn('[SYNC] Initial sync warning:', initialResult.error);
        }
      });
    }
  }, [syncInitialized, queryClient, result.data]);

  // Listen for background sync updates
  React.useEffect(() => {
    const handleSyncUpdate = (event: CustomEvent) => {
      const syncResult = event.detail;
      
      if (syncResult.data) {
        queryClient.setQueryData(['lender-products'], syncResult.data);
        
        if (!syncResult.fromCache) {
          toast({
            title: 'Products Updated',
            description: 'New lender product data available',
            variant: 'default'
          });
        }
      }
    };

    window.addEventListener('lender-products-updated', handleSyncUpdate as EventListener);
    
    return () => {
      window.removeEventListener('lender-products-updated', handleSyncUpdate as EventListener);
    };
  }, [queryClient]);

  return {
    ...result,
    isInitialized: syncInitialized
  };
}

/**
 * Hook for sync status and manual refresh
 */
export function useLenderProductsSync() {
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState<any>(null);

  const refreshStatus = React.useCallback(async () => {
    const syncStatus = await getSyncStatus();
    setStatus(syncStatus);
  }, []);

  const forceSync = React.useCallback(async () => {
    const { forceSyncLenderProducts } = await import('./lenderProductSync');
    const result = await forceSyncLenderProducts();
    
    if (result.data) {
      queryClient.setQueryData(['lender-products'], result.data);
    }
    
    await refreshStatus();
    return result;
  }, [queryClient, refreshStatus]);

  React.useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    status,
    forceSync,
    refreshStatus
  };
}