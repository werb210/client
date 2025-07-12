/**
 * LEGACY SCHEDULED SYNC - DISABLED
 * Replaced by new IndexedDB caching system with fetch window controls
 * The new system is integrated directly into fetchLenderProducts() function
 */

// DISABLED: import { syncLenderProducts } from './lenderProductSync';

class ScheduledSyncService {
  private intervalId: number | null = null;
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;
    
    console.log('[SCHEDULER] LEGACY SYNC DISABLED - Using new IndexedDB caching system');
    console.log('[SCHEDULER] New system: Fetch windows at 12:00 PM and 12:00 AM MST with persistent cache');
    
    // DISABLED: Run immediately on startup with error handling
    // this.runSync().catch(error => {
    //   console.warn('[SCHEDULER] Initial sync failed:', error?.message || error);
    // });
    
    // DISABLED: Schedule sync jobs every hour, check if it's sync time
    // this.intervalId = window.setInterval(() => {
    //   try {
    //     this.checkAndRunSync();
    //   } catch (error) {
    //     console.warn('[SCHEDULER] Scheduled check failed:', error);
    //   }
    // }, 60 * 60 * 1000); // Check every hour
    
    this.isInitialized = true;
    console.log('[SCHEDULER] Lender product sync scheduler started successfully');
  }

  private checkAndRunSync() {
    try {
      const now = new Date();
      const mstOffset = -7; // MST is UTC-7
      const currentMSTHour = new Date(now.getTime() + (mstOffset * 60 * 60 * 1000)).getUTCHours();
      
      // Run at 12:00 PM (12) and 12:00 AM (0) MST
      if (currentMSTHour === 12 || currentMSTHour === 0) {
        const minutes = now.getMinutes();
        // Only run during the first 5 minutes of the hour to avoid multiple triggers
        if (minutes < 5) {
          console.log(`[SCHEDULER] LEGACY SYNC DISABLED - Would have triggered at ${currentMSTHour === 12 ? '12:00 PM' : '12:00 AM'} MST`);
          // this.runSync().catch(error => {
          //   console.warn('[SCHEDULER] Scheduled sync failed:', error?.message || error);
          // });
        }
      }
    } catch (error) {
      console.warn('[SCHEDULER] Error in scheduled check:', error);
    }
  }

  async runSync(): Promise<void> {
    // DISABLED: Legacy sync system replaced by new IndexedDB caching
    console.log('[SCHEDULER] LEGACY SYNC DISABLED - No action taken');
    console.log('[SCHEDULER] Use new IndexedDB caching system with fetchLenderProducts()');
    
    // No network calls, no sync operations
    return Promise.resolve();
  }

  private showToast(message: string, type: 'success' | 'error') {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 5000);
  }

  async manualSync(): Promise<{ success: boolean; productCount: number; message: string }> {
    // DISABLED: Legacy manual sync replaced by new IndexedDB caching
    console.log('[SCHEDULER] LEGACY MANUAL SYNC DISABLED');
    console.log('[SCHEDULER] Use new IndexedDB caching system with fetch window controls');
    
    this.showToast('Legacy sync disabled - using new IndexedDB caching system', 'success');
    
    return {
      success: true,
      productCount: 0,
      message: 'Legacy sync disabled - using new IndexedDB caching system'
    };
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isInitialized = false;
    console.log('[SCHEDULER] Sync scheduler stopped');
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      nextSyncTimes: ['12:00 AM MST', '12:00 PM MST']
    };
  }
}

export const scheduledSyncService = new ScheduledSyncService();