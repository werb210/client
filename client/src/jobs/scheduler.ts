import { syncLenderProducts } from "./syncLenderProducts";

// Track scheduler status
let isSchedulerRunning = false;
let lastSyncResult: any = null;
let schedulerInterval: NodeJS.Timeout | null = null;

// Initialize scheduler - runs twice daily at 12:00 PM and 12:00 AM MST
export function initializeScheduler() {
  if (isSchedulerRunning) {
    console.log('[SCHEDULER] Already running, skipping initialization');
    return;
  }

  console.log('[SCHEDULER] Initializing lender product sync scheduler');
  console.log('[SCHEDULER] Schedule: 12:00 PM and 12:00 AM MST');

  // Check every hour if it's time to sync
  schedulerInterval = setInterval(async () => {
    if (isTimeToSync()) {
      console.log('[SCHEDULER] Scheduled sync job triggered');
      await runScheduledSync();
    }
  }, 60 * 60 * 1000); // Check every hour

  // Run initial sync on startup if we haven't synced today
  checkInitialSync();

  isSchedulerRunning = true;
  console.log('[SCHEDULER] Lender product sync scheduler started successfully');
}

// Check if it's time to sync (12 PM or 12 AM MST)
function isTimeToSync(): boolean {
  const now = new Date();
  const mstOffset = -7 * 60; // MST is UTC-7
  const mstTime = new Date(now.getTime() + (mstOffset * 60 * 1000));
  
  const currentHour = mstTime.getUTCHours();
  const currentMinute = mstTime.getUTCMinutes();
  
  // Sync at 12:00 PM (noon) or 12:00 AM (midnight) MST
  const isSyncTime = (currentHour === 12 || currentHour === 0) && currentMinute === 0;
  
  // Check if we already synced this hour
  const lastSyncTime = localStorage.getItem('lastSyncTime');
  if (lastSyncTime) {
    const lastSync = new Date(lastSyncTime);
    const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
    
    // Don't sync if we synced in the last hour
    if (hoursSinceSync < 1) {
      return false;
    }
  }
  
  return isSyncTime;
}

// Run the scheduled sync
async function runScheduledSync() {
  try {
    const result = await syncLenderProducts();
    lastSyncResult = {
      ...result,
      timestamp: new Date().toISOString()
    };
    
    // Store last sync time in localStorage for monitoring
    localStorage.setItem('lastSyncTime', lastSyncResult.timestamp);
    
    if (result.success) {
      console.log(`[SCHEDULER] Sync completed successfully: ${result.changes} changes, ${result.total} total products from ${result.source}`);
    } else {
      console.error(`[SCHEDULER] Sync failed: ${result.error}`);
    }
  } catch (error) {
    console.error('[SCHEDULER] Sync job error:', error);
    lastSyncResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// Check if we need to run initial sync
async function checkInitialSync() {
  const lastSyncTime = localStorage.getItem('lastSyncTime');
  
  if (!lastSyncTime) {
    console.log('[SCHEDULER] No previous sync found, running initial sync');
    await runScheduledSync();
    return;
  }
  
  const lastSync = new Date(lastSyncTime);
  const hoursSinceSync = (new Date().getTime() - lastSync.getTime()) / (1000 * 60 * 60);
  
  // If more than 12 hours since last sync, run one now
  if (hoursSinceSync > 12) {
    console.log('[SCHEDULER] Last sync was more than 12 hours ago, running sync now');
    await runScheduledSync();
  }
}

// Manual trigger for testing
export async function triggerManualSync(): Promise<any> {
  console.log('[SCHEDULER] Manual sync triggered with debug logging');
  
  try {
    // Enhanced debug: Test direct API call first
    const staffUrl = 'https://staffportal.replit.app/api/public/lenders';
    console.log('[DEBUG] Testing direct API call to:', staffUrl);
    
    const testResponse = await fetch(staffUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('[DEBUG] Direct API status:', testResponse.status);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      const productCount = Array.isArray(testData) ? testData.length : (testData.products?.length || 0);
      console.log('[DEBUG] Direct API returned', productCount, 'products');
      
      if (productCount > 0) {
        console.log('[DEBUG] Sample product structure:', Array.isArray(testData) ? testData[0] : testData.products?.[0]);
      }
    } else {
      console.log('[DEBUG] Direct API failed with status:', testResponse.status);
    }
    
    // Now run sync with enhanced logging
    console.log('[DEBUG] Starting syncLenderProducts...');
    const result = await syncLenderProducts();
    console.log('[DEBUG] Sync completed with result:', result);
    
    lastSyncResult = {
      ...result,
      timestamp: new Date().toISOString(),
      manual: true
    };
    
    localStorage.setItem('lastSyncTime', lastSyncResult.timestamp);
    return lastSyncResult;
  } catch (error) {
    console.error('[DEBUG] Manual sync error:', error);
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      manual: true
    };
    
    lastSyncResult = errorResult;
    return errorResult;
  }
}

// Get scheduler status
export function getSchedulerStatus() {
  return {
    isRunning: isSchedulerRunning,
    lastSyncResult,
    nextRun: getNextScheduledRun()
  };
}

// Calculate next scheduled run time
function getNextScheduledRun(): string {
  const now = new Date();
  
  // Convert to MST (UTC-7)
  const mstNow = new Date(now.getTime() - (7 * 60 * 60 * 1000));
  const currentHour = mstNow.getHours();
  
  let nextRun = new Date(mstNow);
  
  if (currentHour < 12) {
    // Next run is today at noon
    nextRun.setHours(12, 0, 0, 0);
  } else {
    // Next run is tomorrow at midnight
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(0, 0, 0, 0);
  }
  
  // Convert back to UTC for consistent display
  return new Date(nextRun.getTime() + (7 * 60 * 60 * 1000)).toISOString();
}

// Stop scheduler (for cleanup)
export function stopScheduler() {
  isSchedulerRunning = false;
  console.log('[SCHEDULER] Scheduler stopped');
}