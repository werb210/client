/**
 * Scheduled Sync Jobs - 12:00 PM and 12:00 AM MST
 * Automatically syncs lender products from staff API
 */

import { syncLenderProducts } from './lenderProductSync';

class ScheduledSyncService {
  private intervalId: number | null = null;
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;
    
    console.log('[SCHEDULER] Initializing lender product sync scheduler');
    console.log('[SCHEDULER] Schedule: 12:00 PM and 12:00 AM MST');
    
    // Run immediately on startup with error handling
    this.runSync().catch(error => {
      console.warn('[SCHEDULER] Initial sync failed:', error?.message || error);
    });
    
    // Schedule sync jobs every hour, check if it's sync time
    this.intervalId = window.setInterval(() => {
      try {
        this.checkAndRunSync();
      } catch (error) {
        console.warn('[SCHEDULER] Scheduled check failed:', error);
      }
    }, 60 * 60 * 1000); // Check every hour
    
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
          console.log(`[SCHEDULER] Triggering scheduled sync at ${currentMSTHour === 12 ? '12:00 PM' : '12:00 AM'} MST`);
          this.runSync().catch(error => {
            console.warn('[SCHEDULER] Scheduled sync failed:', error?.message || error);
          });
        }
      }
    } catch (error) {
      console.warn('[SCHEDULER] Error in scheduled check:', error);
    }
  }

  async runSync(): Promise<void> {
    try {
      console.log('[SCHEDULER] Starting scheduled lender product sync...');
      
      const result = await syncLenderProducts();
      
      if (result.success) {
        console.log(`[SCHEDULER] ✅ Sync successful: ${result.data?.length || 0} products`);
        this.showToast(`Successfully synced ${result.data?.length || 0} lender products`, 'success');
      } else {
        console.error(`[SCHEDULER] ❌ Sync failed: ${result.error || 'Unknown error'}`);
        this.showToast(`Sync failed: ${result.error || 'Unknown error'}`, 'error');
      }
      
    } catch (error) {
      const message = `Sync error: ${(error as Error).message}`;
      console.error('[SCHEDULER]', message);
      this.showToast(message, 'error');
    }
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
    try {
      console.log('[SCHEDULER] Manual sync triggered');
      const result = await syncLenderProducts();
      
      this.showToast(
        result.success 
          ? `Manual sync: ${result.data?.length || 0} products updated`
          : `Manual sync failed: ${result.error || 'Unknown error'}`,
        result.success ? 'success' : 'error'
      );
      
      return {
        success: result.success,
        productCount: result.data?.length || 0,
        message: result.error || 'Success'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('[SCHEDULER] Manual sync error:', errorMessage);
      
      this.showToast(`Manual sync failed: ${errorMessage}`, 'error');
      
      return {
        success: false,
        productCount: 0,
        message: errorMessage
      };
    }
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