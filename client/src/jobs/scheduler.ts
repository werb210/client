import { syncLenderProducts } from "./syncLenderProducts";

// Track scheduler status
let isSchedulerRunning = false;
let lastSyncResult: any = null;
let schedulerInterval: NodeJS.Timeout | null = null;

// LEGACY SCHEDULER DISABLED - Replaced by IndexedDB cache-only system
export function initializeScheduler() {
  if (isSchedulerRunning) {
    console.log('[SCHEDULER] LEGACY SYNC DISABLED - Already marked as running');
    return;
  }

  console.log('[SCHEDULER] LEGACY SYNC DISABLED - Using new IndexedDB cache-only system');
  console.log('[SCHEDULER] NO BACKGROUND SYNC JOBS - Cache populated manually at /cache-setup');

  // DISABLED: Check every hour if it's time to sync
  // schedulerInterval = setInterval(async () => {
  //   if (isTimeToSync()) {
  //     console.log('[SCHEDULER] Scheduled sync job triggered');
  //     await runScheduledSync();
  //   }
  // }, 60 * 60 * 1000); // Check every hour

  // DISABLED: Run initial sync on startup if we haven't synced today
  // checkInitialSync();

  isSchedulerRunning = true;
  console.log('[SCHEDULER] Legacy scheduler marked as disabled - no background jobs');
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

// DISABLED: Run the scheduled sync
async function runScheduledSync() {
  console.log('[SCHEDULER] LEGACY SYNC DISABLED - No background sync operations');
  console.log('[SCHEDULER] Cache should be populated manually using /cache-setup page');
  
  // Return success result without any network operations
  lastSyncResult = {
    success: true,
    changes: 0,
    total: 0,
    source: 'disabled_legacy_system',
    timestamp: new Date().toISOString()
  };
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
  const result = {
    success: true,
    source: 'cache_only',
    changes: 0,
    total: 0,
    timestamp: new Date().toISOString()
  };
  
  lastSyncResult = result;
  return result;
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