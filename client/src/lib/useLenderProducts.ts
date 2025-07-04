/**
 * Lender Products Hook with IndexedDB Caching
 * Uses idb-keyval for persistent caching and graceful degradation
 */

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { get, set } from 'idb-keyval';
import { toast } from '@/hooks/use-toast';

// Cache keys for IndexedDB
const CACHE_KEY_PRODUCTS = 'lender_products_cache';
const CACHE_KEY_TIMESTAMP = 'lender_products_cache_ts';

// Types
interface LenderProduct {
  id: string;
  name: string;
  lenderName: string;
  category: string;
  country: string;
  minAmount: number;
  maxAmount: number;
  interestRateMin?: number;
  interestRateMax?: number;
  termMin?: number;
  termMax?: number;
  description: string;
  lastSynced?: number;
}

interface LenderProductsResponse {
  success: boolean;
  products: LenderProduct[];
  count: number;
  message?: string;
}

// API fetch function
async function fetchFromAPI(): Promise<LenderProduct[]> {
  console.log('[LenderProducts] Fetching from staff API...');
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/lenders`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer CLIENT_APP_SHARED_TOKEN'
    },
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data: LenderProductsResponse = await response.json();
  
  if (!data.success || !Array.isArray(data.products)) {
    throw new Error('Invalid API response format');
  }

  console.log(`[LenderProducts] API returned ${data.products.length} products`);
  
  // If staff API returns empty, use fallback data
  if (data.products.length === 0) {
    console.warn('[LenderProducts] Staff API empty - using fallback data');
    
    const { FALLBACK_LENDER_PRODUCTS } = await import('./fallbackData');
    return FALLBACK_LENDER_PRODUCTS.map(product => ({
      ...product,
      lastSynced: Date.now()
    }));
  }

  return data.products;
}

// Get initial data from IndexedDB cache
async function getInitialData(): Promise<LenderProduct[] | undefined> {
  try {
    const cachedProducts = await get(CACHE_KEY_PRODUCTS);
    const cachedTimestamp = await get(CACHE_KEY_TIMESTAMP);
    
    if (cachedProducts && Array.isArray(cachedProducts)) {
      console.log(`[LenderProducts] Loading ${cachedProducts.length} products from cache`);
      
      if (cachedTimestamp) {
        const cacheAge = Date.now() - new Date(cachedTimestamp).getTime();
        console.log(`[LenderProducts] Cache age: ${Math.round(cacheAge / 1000 / 60)} minutes`);
      }
      
      return cachedProducts;
    }
  } catch (error) {
    console.warn('[LenderProducts] Failed to load cache:', error);
  }
  
  return undefined;
}

// Main hook
export function useLenderProducts() {
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['lender-products'],
    queryFn: fetchFromAPI,
    refetchInterval: 5 * 60_000, // 5 minutes
    retry: 3,
    staleTime: 4 * 60_000, // 4 minutes - data is fresh for 4 minutes
    gcTime: 10 * 60_000, // 10 minutes - keep in memory for 10 minutes
    
    // Enhanced error handling
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Initialize with cached data if available
  React.useEffect(() => {
    if (!result.data && !result.isLoading) {
      getInitialData().then(cachedData => {
        if (cachedData && cachedData.length > 0) {
          console.log(`[LenderProducts] Loading ${cachedData.length} products from IndexedDB cache`);
          queryClient.setQueryData(['lender-products'], cachedData);
        }
      });
    }
  }, [result.data, result.isLoading, queryClient]);

  // Handle successful data fetching
  React.useEffect(() => {
    if (result.data && result.isSuccess) {
      (async () => {
        try {
          await set(CACHE_KEY_PRODUCTS, result.data);
          await set(CACHE_KEY_TIMESTAMP, new Date().toISOString());
          console.log(`[LenderProducts] Cached ${result.data.length} products to IndexedDB`);
        } catch (error) {
          console.warn('[LenderProducts] Failed to cache data:', error);
        }
      })();
    }
  }, [result.data, result.isSuccess]);

  // Handle errors with fallback to cache
  React.useEffect(() => {
    if (result.isError && result.error) {
      console.warn('[LenderProducts] API unreachable – checking cache', result.error);
      
      (async () => {
        const cachedData = await getInitialData();
        
        if (cachedData && cachedData.length > 0) {
          console.log(`[LenderProducts] Using ${cachedData.length} cached products`);
          
          // Set cached data as query data
          queryClient.setQueryData(['lender-products'], cachedData);
          
          toast({
            title: 'Using Cached Data',
            description: 'API unavailable. Displaying cached lender products.',
            variant: 'default'
          });
        } else {
          // No cache available - show graceful degradation
          console.error('[LenderProducts] No cache available - graceful degradation');
          
          toast({
            title: 'Lender Catalog Unavailable',
            description: 'Please retry or contact support.',
            variant: 'destructive'
          });
        }
      })();
    }
  }, [result.isError, result.error, queryClient]);

  return result;
}

// Helper hook for cache management
export function useLenderProductsCache() {
  const queryClient = useQueryClient();

  const invalidateCache = async () => {
    console.log('[LenderProducts] Invalidating cache and refetching...');
    
    // Clear IndexedDB cache
    await set(CACHE_KEY_PRODUCTS, null);
    await set(CACHE_KEY_TIMESTAMP, null);
    
    // Invalidate React Query cache
    queryClient.invalidateQueries({ queryKey: ['lender-products'] });
  };

  const getCacheStatus = async () => {
    const cachedProducts = await get(CACHE_KEY_PRODUCTS);
    const cachedTimestamp = await get(CACHE_KEY_TIMESTAMP);
    
    return {
      hasCache: Boolean(cachedProducts && Array.isArray(cachedProducts)),
      productCount: cachedProducts?.length || 0,
      timestamp: cachedTimestamp,
      age: cachedTimestamp ? Date.now() - new Date(cachedTimestamp).getTime() : null
    };
  };

  return {
    invalidateCache,
    getCacheStatus
  };
}

// WebSocket/SSE listener setup
export function setupLenderProductsListener() {
  const queryClient = useQueryClient();

  // WebSocket listener for real-time updates
  const setupWebSocketListener = () => {
    // Check if WebSocket is available
    if (typeof WebSocket === 'undefined') {
      console.warn('[LenderProducts] WebSocket not available');
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'lender_products.updated') {
            console.log('[LenderProducts] Received update notification - invalidating cache');
            
            queryClient.invalidateQueries({ queryKey: ['lender-products'] });
            
            toast({
              title: 'Lender Products Updated',
              description: 'New product data available. Refreshing...',
              variant: 'default'
            });
          }
        } catch (error) {
          console.warn('[LenderProducts] Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.warn('[LenderProducts] WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('[LenderProducts] WebSocket connection closed');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(setupWebSocketListener, 5000);
      };
      
      return ws;
    } catch (error) {
      console.warn('[LenderProducts] Failed to setup WebSocket listener:', error);
    }
  };

  // Initialize WebSocket listener
  const ws = setupWebSocketListener();
  
  // Return cleanup function
  return () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}