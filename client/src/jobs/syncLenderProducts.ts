import { fetchLenderProducts } from "@/api/lenderProducts";
import { getAllLocalProducts, upsertProducts, clearLocalProducts } from "@/db/lenderProducts";

export async function syncLenderProducts(): Promise<{
  success: boolean;
  changes: number;
  total: number;
  source: string;
  error?: string;
}> {
  const startTime = new Date();
  console.log(`[SYNC] Starting lender products sync at ${startTime.toISOString()}`);

  try {
    // Fetch from staff API (with fallback to local server API)
    const remoteProducts = await fetchLenderProducts();
    console.log(`[SYNC] Fetched ${remoteProducts.length} products from remote`);

    // Get current local products
    const localProducts = await getAllLocalProducts();
    console.log(`[SYNC] Found ${localProducts.length} products in local storage`);

    // Create map for efficient comparison
    const localMap = new Map(localProducts.map(p => [p.id, p]));
    let changes = 0;
    const productsToUpdate = [];

    // Compare each remote product with local version
    for (const remoteProduct of remoteProducts) {
      const localProduct = localMap.get(remoteProduct.id);
      
      // Check if product is new or has changed
      const isNew = !localProduct;
      const isChanged = localProduct && (
        localProduct.productName !== remoteProduct.productName ||
        localProduct.lenderName !== remoteProduct.lenderName ||
        localProduct.productType !== remoteProduct.productType ||
        localProduct.minAmount !== remoteProduct.minAmount ||
        localProduct.maxAmount !== remoteProduct.maxAmount ||
        localProduct.description !== remoteProduct.description ||
        localProduct.isActive !== remoteProduct.isActive ||
        JSON.stringify(localProduct.geography) !== JSON.stringify(remoteProduct.geography) ||
        JSON.stringify(localProduct.industries) !== JSON.stringify(remoteProduct.industries)
      );

      if (isNew || isChanged) {
        productsToUpdate.push(remoteProduct);
        changes++;
        console.log(`[SYNC] ${isNew ? 'NEW' : 'UPDATED'}: ${remoteProduct.productName} (${remoteProduct.lenderName})`);
      }
    }

    // Batch update changed/new products
    if (productsToUpdate.length > 0) {
      await upsertProducts(productsToUpdate);
      console.log(`[SYNC] Successfully updated ${productsToUpdate.length} products`);
    }

    // Determine data source
    const source = remoteProducts.length > 8 ? 'Staff API' : 'Local Fallback';
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log(`[SYNC] Completed in ${duration}ms: ${changes} products ${changes === 1 ? 'was' : 'were'} added or updated`);
    console.log(`[SYNC] Data source: ${source} (${remoteProducts.length} total products)`);

    return {
      success: true,
      changes,
      total: remoteProducts.length,
      source
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("[SYNC ERROR]", errorMessage);
    
    return {
      success: false,
      changes: 0,
      total: 0,
      source: 'Error',
      error: errorMessage
    };
  }
}

// Manual sync function for testing/debugging
export async function forceSyncLenderProducts(): Promise<void> {
  console.log('[SYNC] Force sync initiated - clearing local storage first');
  
  try {
    await clearLocalProducts();
    console.log('[SYNC] Local storage cleared');
    
    const result = await syncLenderProducts();
    console.log('[SYNC] Force sync completed:', result);
  } catch (error) {
    console.error('[SYNC] Force sync failed:', error);
  }
}

// Get last sync status for monitoring
export async function getLastSyncStatus(): Promise<{
  lastRun: string | null;
  nextRun: string;
}> {
  // Calculate next scheduled runs (12 PM and 12 AM MST)
  const now = new Date();
  const mstOffset = -7 * 60; // MST is UTC-7
  
  // Get current time in MST
  const mstTime = new Date(now.getTime() + (mstOffset * 60 * 1000));
  const currentHour = mstTime.getUTCHours();
  
  // Determine next run time
  let nextRunHour: number;
  if (currentHour < 12) {
    nextRunHour = 12; // Next noon
  } else {
    nextRunHour = 0; // Next midnight (tomorrow)
  }
  
  const nextRun = new Date(mstTime);
  nextRun.setUTCHours(nextRunHour, 0, 0, 0);
  
  // If next run is midnight, add a day
  if (nextRunHour === 0) {
    nextRun.setUTCDate(nextRun.getUTCDate() + 1);
  }

  return {
    lastRun: localStorage.getItem('lastSyncTime'),
    nextRun: nextRun.toISOString()
  };
}