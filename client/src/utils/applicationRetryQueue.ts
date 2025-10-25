/**
 * ✅ APPLICATION RETRY QUEUE SYSTEM - STAFF API ONLY
 * Stores failed application POST and upload attempts for retry when staff API is available
 * All calls use same-origin relative paths only
 */

import { logger } from '@/lib/utils';

export interface QueuedApplication {
  id: string;
  applicationId: string;
  payload: any;
  timestamp: string;
  retryCount: number;
  lastAttempt?: string;
  error?: string;
  type: 'application' | 'upload' | 'finalization';
  fileName?: string; // For upload attempts
  documentType?: string; // For upload attempts
  file?: File; // For upload attempts
}

const STORAGE_KEY = 'boreal_application_retry_queue';
const MAX_RETRY_ATTEMPTS = 5;
const BASE = ""; // same-origin only

const isBrowser = typeof window !== 'undefined';

function readQueue(): QueuedApplication[] {
  if (!isBrowser) {
    return [];
  }

  try {
    const stored = window.localStorage?.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ [RETRY QUEUE] Failed to read queue:', error);
    return [];
  }
}

function writeQueue(queue: QueuedApplication[]): void {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('❌ [RETRY QUEUE] Failed to persist queue:', error);
  }
}

/**
 * Retry submitting application using Staff API
 */
export async function retrySubmitApplication(payload: any) {
  // All staff calls are relative paths:
  const res = await fetch(`/api/public/applications`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Retry submit failed: ${res.status}`);
  return res.json();
}

/**
 * Add failed application/upload attempt to retry queue
 */
export function addToRetryQueue(item: Omit<QueuedApplication, 'id' | 'timestamp' | 'retryCount'>): void {
  if (!isBrowser) {
    logger.warn('⚠️ [RETRY QUEUE] Skipping queue update outside browser runtime');
    return;
  }

  try {
    const queue = readQueue();
    const queueItem: QueuedApplication = {
      ...item,
      id: `retry_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    queue.push(queueItem);
    writeQueue(queue);

    logger.log(`🔄 [RETRY QUEUE] Added ${item.type} to retry queue:`, {
      applicationId: item.applicationId,
      type: item.type,
      fileName: item.fileName,
      queueSize: queue.length,
    });
  } catch (error) {
    console.error('❌ [RETRY QUEUE] Failed to add item to queue:', error);
  }
}

/**
 * Get all items in retry queue
 */
export function getRetryQueue(): QueuedApplication[] {
  return readQueue();
}

/**
 * Remove item from retry queue
 */
export function removeFromRetryQueue(itemId: string): void {
  if (!isBrowser) {
    return;
  }

  try {
    const queue = readQueue();
    const updatedQueue = queue.filter((item) => item.id !== itemId);
    writeQueue(updatedQueue);

    logger.log(`✅ [RETRY QUEUE] Removed item from queue:`, { itemId, remainingItems: updatedQueue.length });
  } catch (error) {
    console.error('❌ [RETRY QUEUE] Failed to remove item:', error);
  }
}

/**
 * Update retry attempt for item
 */
export function updateRetryAttempt(itemId: string, error?: string): void {
  if (!isBrowser) {
    return;
  }

  try {
    const queue = readQueue();
    const itemIndex = queue.findIndex((item) => item.id === itemId);

    if (itemIndex !== -1) {
      queue[itemIndex].retryCount += 1;
      queue[itemIndex].lastAttempt = new Date().toISOString();
      if (error) queue[itemIndex].error = error;

      writeQueue(queue);

      logger.log(`🔄 [RETRY QUEUE] Updated retry attempt:`, {
        itemId,
        retryCount: queue[itemIndex].retryCount,
        error,
      });
    }
  } catch (caughtError) {
    console.error('❌ [RETRY QUEUE] Failed to update retry attempt:', caughtError);
  }
}

/**
 * Get pending retry count
 */
export function getPendingRetryCount(): number {
  return getRetryQueue().length;
}

/**
 * Get retry queue summary for UI display
 */
export function getRetryQueueSummary(): {
  total: number;
  applications: number;
  uploads: number;
  finalizations: number;
} {
  const queue = getRetryQueue();
  
  return {
    total: queue.length,
    applications: queue.filter(item => item.type === 'application').length,
    uploads: queue.filter(item => item.type === 'upload').length,
    finalizations: queue.filter(item => item.type === 'finalization').length
  };
}

/**
 * Check if staff API is healthy
 */
export async function checkStaffAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch (error) {
    console.warn('🔍 [HEALTH CHECK] Staff API health check failed:', error);
    return false;
  }
}

/**
 * Process retry queue when API is available
 */
export async function processRetryQueue(): Promise<{ success: number; failed: number }> {
  const queue = getRetryQueue();
  let successCount = 0;
  let failedCount = 0;
  
  if (queue.length === 0) {
    logger.log('🔄 [RETRY QUEUE] No items to retry');
    return { success: 0, failed: 0 };
  }
  
  logger.log(`🔄 [RETRY QUEUE] Processing ${queue.length} queued items...`);
  
  // Check API health first
  const isHealthy = await checkStaffAPIHealth();
  if (!isHealthy) {
    logger.log('⚠️ [RETRY QUEUE] Staff API not healthy, skipping retry');
    return { success: 0, failed: 0 };
  }
  
  for (const item of queue) {
    if (item.retryCount >= MAX_RETRY_ATTEMPTS) {
      logger.log(`❌ [RETRY QUEUE] Max retries exceeded for item:`, item.id);
      removeFromRetryQueue(item.id);
      failedCount++;
      continue;
    }
    
    try {
      const success = await retryQueuedItem(item);
      if (success) {
        removeFromRetryQueue(item.id);
        successCount++;
        logger.log(`✅ [RETRY QUEUE] Successfully processed:`, {
          type: item.type,
          applicationId: item.applicationId,
          fileName: item.fileName
        });
      } else {
        updateRetryAttempt(item.id, 'Retry failed');
        failedCount++;
      }
    } catch (error) {
      updateRetryAttempt(item.id, error instanceof Error ? error.message : 'Unknown error');
      failedCount++;
      logger.log(`❌ [RETRY QUEUE] Failed to process item:`, {
        itemId: item.id,
        error: error instanceof Error ? error.message : error
      });
    }
  }
  
  logger.log(`🎯 [RETRY QUEUE] Processing complete:`, { success: successCount, failed: failedCount });
  return { success: successCount, failed: failedCount };
}

/**
 * Retry individual queued item
 */
async function retryQueuedItem(item: QueuedApplication): Promise<boolean> {
  try {
    switch (item.type) {
      case 'application':
        return await retryApplicationCreation(item);
      case 'upload':
        return await retryDocumentUpload(item);
      case 'finalization':
        return await retryApplicationFinalization(item);
      default:
        logger.log(`❌ [RETRY QUEUE] Unknown item type:`, item.type);
        return false;
    }
  } catch (error) {
    logger.log(`❌ [RETRY QUEUE] Error retrying item:`, error);
    return false;
  }
}

/**
 * Retry application creation
 */
async function retryApplicationCreation(item: QueuedApplication): Promise<boolean> {
  const response = await fetch('/api/public/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
    },
    body: JSON.stringify(item.payload)
  });
  
  return response.ok;
}

/**
 * Retry document upload
 */
async function retryDocumentUpload(item: QueuedApplication): Promise<boolean> {
  if (!item.file || !item.documentType) {
    logger.log(`❌ [RETRY QUEUE] Missing file or documentType for upload retry`);
    return false;
  }
  
  const formData = new FormData();
  formData.append('document', item.file);
  formData.append('documentType', item.documentType);
  
  const response = await fetch(`/api/public/upload/${item.applicationId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
    },
    body: formData
  });
  
  return response.ok;
}

/**
 * Retry application finalization
 */
async function retryApplicationFinalization(item: QueuedApplication): Promise<boolean> {
  const response = await fetch(`/api/public/applications/${item.applicationId}/finalize`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
    },
    body: JSON.stringify(item.payload || {})
  });
  
  return response.ok;
}

// Manual retry function removed per client requirements

// Manual retry debugging functions removed per client requirements

/**
 * Export debug logs for staff support
 */
export function exportDebugLogs(): string {
  const queue = getRetryQueue();
  const summary = getRetryQueueSummary();

  const debugData = {
    timestamp: new Date().toISOString(),
    summary,
    queueItems: queue.map(item => ({
      id: item.id,
      applicationId: item.applicationId,
      type: item.type,
      timestamp: item.timestamp,
      retryCount: item.retryCount,
      lastAttempt: item.lastAttempt,
      error: item.error,
      fileName: item.fileName,
      documentType: item.documentType
    })),
    system: {
      userAgent: isBrowser ? navigator.userAgent : 'unknown',
      url: isBrowser ? window.location.href : 'n/a',
      apiBaseUrl: (import.meta as any).env?.VITE_API_BASE_URL ?? 'n/a'
    }
  };

  try {
    return JSON.stringify(debugData, null, 2);
  } catch (error) {
    console.error('❌ [RETRY QUEUE] Failed to serialize debug logs:', error);
    return JSON.stringify({ timestamp: new Date().toISOString(), summary, error: 'serialization_failed' });
  }
}

/**
 * Clear all retry queue items (for debugging)
 */
export function clearRetryQueue(): void {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage?.removeItem(STORAGE_KEY);
    logger.log('🗑️ [RETRY QUEUE] Cleared all retry queue items');
  } catch (error) {
    console.error('❌ [RETRY QUEUE] Failed to clear queue:', error);
  }
}