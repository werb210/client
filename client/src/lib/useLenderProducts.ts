/**
 * Lender Products Hook with Production-Ready Sync System
 * Implements robust caching, retry logic, and data preservation
 */

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// LEGACY SYNC IMPORTS DISABLED - Using new IndexedDB caching system
// import { syncLenderProducts, initializeSyncSystem, getSyncStatus } from './lenderProductSync';
import { toast } from '@/hooks/use-toast';

export function useLenderProducts() {
  // LEGACY HOOK DISABLED - Using new IndexedDB caching system
  // Use fetchLenderProducts() from api/lenderProducts.ts instead
  
  console.warn('[LEGACY] useLenderProducts hook disabled - use fetchLenderProducts() with IndexedDB caching');
  
  return {
    data: [],
    isLoading: false,
    error: new Error('Legacy hook disabled - use fetchLenderProducts() with IndexedDB caching'),
    isInitialized: true
  };

  // LEGACY EFFECTS DISABLED
}

/**
 * LEGACY Hook for sync status - DISABLED
 * Use new IndexedDB caching system with fetchLenderProducts() instead
 */
export function useLenderProductsSync() {
  console.warn('[LEGACY] useLenderProductsSync hook disabled - use fetchLenderProducts() with IndexedDB caching');
  
  return {
    status: { disabled: true, message: 'Legacy sync disabled - using IndexedDB caching' },
    forceSync: async () => ({ success: false, message: 'Legacy sync disabled' }),
    refreshStatus: () => Promise.resolve()
  };
}