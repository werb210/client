/**
 * Scheduled Sync Jobs - 12:00 PM and 12:00 AM MST
 * Automatically syncs lender products from staff API
 */

import { syncManager } from './syncManager';

class ScheduledSyncService {
  private intervalId: number | null = null;
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;
    
    console.log('[SCHEDULER] Initializing lender product sync scheduler');
    console.log('[SCHEDULER] Schedule: 12:00 PM and 12:00 AM MST');
    
    // Run immediately on startup
    this.runSync();
    
    // Schedule sync jobs every hour, check if it's sync time
    this.intervalId = window.setInterval(() => {
      this.checkAndRunSync();
    }, 60 * 60 * 1000); // Check every hour
    
    this.isInitialized = true;
    console.log('[SCHEDULER] Lender product sync scheduler started successfully');
  }

  private checkAndRunSync() {
    const now = new Date();
    const mstOffset = -7; // MST is UTC-7
    const currentMSTHour = new Date(now.getTime() + (mstOffset * 60 * 60 * 1000)).getUTCHours();
    
    // Run at 12:00 PM (12) and 12:00 AM (0) MST
    if (currentMSTHour === 12 || currentMSTHour === 0) {
      const minutes = now.getMinutes();
      // Only run during the first 5 minutes of the hour to avoid multiple triggers
      if (minutes < 5) {
        console.log(`[SCHEDULER] Triggering scheduled sync at ${currentMSTHour === 12 ? '12:00 PM' : '12:00 AM'} MST`);
        this.runSync();
      }
    }
  }

  async runSync(): Promise<void> {
    try {
      console.log('[SCHEDULER] Starting scheduled lender product sync...');
      
      const result = await syncManager.pullLiveData();
      
      if (result.success) {
        console.log(`[SCHEDULER] ✅ Sync successful: ${result.productCount} products`);
        this.showToast(`Successfully synced ${result.productCount} lender products`, 'success');
      } else {
        console.error(`[SCHEDULER] ❌ Sync failed: ${result.message}`);
        this.showToast(`Sync failed: ${result.message}`, 'error');
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
    console.log('[SCHEDULER] Manual sync triggered');
    const result = await syncManager.pullLiveData();
    
    this.showToast(
      result.success 
        ? `Manual sync: ${result.productCount} products updated`
        : `Manual sync failed: ${result.message}`,
      result.success ? 'success' : 'error'
    );
    
    return result;
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