import * as cron from "node-cron";
import { syncLenderProducts } from "./syncLenderProducts";

// Track scheduler status
let isSchedulerRunning = false;
let lastSyncResult: any = null;

// Initialize scheduler - runs twice daily at 12:00 PM and 12:00 AM MST
export function initializeScheduler() {
  if (isSchedulerRunning) {
    console.log('[SCHEDULER] Already running, skipping initialization');
    return;
  }

  // MST is UTC-7, so:
  // 12:00 PM MST = 19:00 UTC (7 PM UTC)
  // 12:00 AM MST = 07:00 UTC (7 AM UTC)
  // Cron format: "0 7,19 * * *" = At minute 0 of hours 7 and 19, every day
  
  console.log('[SCHEDULER] Initializing lender product sync scheduler');
  console.log('[SCHEDULER] Schedule: 12:00 PM and 12:00 AM MST (7:00 and 19:00 UTC)');

  // Schedule the sync job
  cron.schedule("0 7,19 * * *", async () => {
    console.log('[SCHEDULER] Scheduled sync job triggered');
    
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
  }, {
    scheduled: true,
    timezone: "America/Denver" // MST timezone
  });

  isSchedulerRunning = true;
  console.log('[SCHEDULER] Lender product sync scheduler started successfully');
}

// Manual trigger for testing
export async function triggerManualSync(): Promise<any> {
  console.log('[SCHEDULER] Manual sync triggered');
  
  try {
    const result = await syncLenderProducts();
    lastSyncResult = {
      ...result,
      timestamp: new Date().toISOString(),
      manual: true
    };
    
    localStorage.setItem('lastSyncTime', lastSyncResult.timestamp);
    return lastSyncResult;
  } catch (error) {
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