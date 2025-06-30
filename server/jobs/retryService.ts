import { db } from '../db';
import { retryQueue, transmissionLogs } from '@shared/lenderSchema';
import { eq, and, lte } from 'drizzle-orm';

export interface RetryQueueItem {
  id: string;
  endpoint: string;
  payload: any;
  try_count: number;
  max_retries: number;
  next_retry_at: Date;
  last_error?: string;
  created_at: Date;
}

export class RetryService {
  private intervalId: NodeJS.Timer | null = null;
  private isRunning = false;

  constructor(private intervalMs: number = 30000) {} // 30 seconds default

  async start() {
    if (this.isRunning) {
      console.log('[RetryService] Already running');
      return;
    }

    this.isRunning = true;
    console.log('[RetryService] Starting retry processor');
    
    this.intervalId = setInterval(async () => {
      try {
        await this.processRetryQueue();
      } catch (error) {
        console.error('[RetryService] Error processing retry queue:', error);
      }
    }, this.intervalMs);
  }

  async stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[RetryService] Stopped retry processor');
  }

  private async processRetryQueue() {
    try {
      // Find items ready for retry
      const items = await db
        .select()
        .from(retryQueue)
        .where(
          and(
            lte(retryQueue.next_retry_at, new Date()),
            lte(retryQueue.try_count, retryQueue.max_retries)
          )
        )
        .limit(10);

      if (items.length === 0) return;

      console.log(`[RetryService] Processing ${items.length} retry items`);

      for (const item of items) {
        await this.processRetryItem(item);
      }
    } catch (error) {
      console.error('[RetryService] Error in processRetryQueue:', error);
    }
  }

  private async processRetryItem(item: any) {
    const startTime = Date.now();
    let success = false;
    let errorMessage = '';
    let responseBody = '';

    try {
      console.log(`[RetryService] Retrying ${item.endpoint} (attempt ${item.try_count + 1})`);

      const response = await fetch(item.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.payload),
      });

      responseBody = await response.text();
      
      if (response.ok) {
        success = true;
        // Remove from retry queue on success
        await db.delete(retryQueue).where(eq(retryQueue.id, item.id));
        console.log(`[RetryService] Success: ${item.endpoint}`);
      } else {
        errorMessage = `HTTP ${response.status}: ${responseBody}`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      errorMessage = error.message || 'Unknown error';
      console.error(`[RetryService] Failed: ${item.endpoint} - ${errorMessage}`);
    }

    const duration = Date.now() - startTime;

    // Log transmission
    await db.insert(transmissionLogs).values({
      route: item.endpoint,
      status: success ? 200 : 500,
      payload: item.payload,
      response_body: responseBody,
      error_message: success ? null : errorMessage,
      duration_ms: duration,
    });

    if (!success) {
      const newTryCount = item.try_count + 1;
      
      if (newTryCount >= item.max_retries) {
        // Max retries reached, remove from queue
        await db.delete(retryQueue).where(eq(retryQueue.id, item.id));
        console.log(`[RetryService] Max retries reached for ${item.endpoint}, removing from queue`);
      } else {
        // Schedule next retry with exponential backoff
        const backoffMs = Math.min(1000 * Math.pow(2, newTryCount), 300000); // Max 5 minutes
        const nextRetryAt = new Date(Date.now() + backoffMs);

        await db
          .update(retryQueue)
          .set({
            try_count: newTryCount,
            last_error: errorMessage,
            next_retry_at: nextRetryAt,
          })
          .where(eq(retryQueue.id, item.id));

        console.log(`[RetryService] Scheduled retry ${newTryCount} for ${item.endpoint} at ${nextRetryAt.toISOString()}`);
      }
    }
  }

  async queueRetry(endpoint: string, payload: any, maxRetries: number = 5) {
    try {
      const nextRetryAt = new Date(Date.now() + 5000); // 5 seconds initial delay

      const [result] = await db.insert(retryQueue).values({
        endpoint,
        payload,
        max_retries: maxRetries,
        next_retry_at: nextRetryAt,
        try_count: 0,
      }).returning();

      console.log(`[RetryService] Queued retry for ${endpoint}`);
      return result;
    } catch (error) {
      console.error('[RetryService] Error queuing retry:', error);
      throw error;
    }
  }

  async getQueueStats() {
    try {
      const [totalItems] = await db
        .select({ count: retryQueue.id })
        .from(retryQueue);

      const [pendingItems] = await db
        .select({ count: retryQueue.id })
        .from(retryQueue)
        .where(lte(retryQueue.try_count, retryQueue.max_retries));

      return {
        total: totalItems?.count || 0,
        pending: pendingItems?.count || 0,
        running: this.isRunning,
      };
    } catch (error) {
      console.error('[RetryService] Error getting queue stats:', error);
      return { total: 0, pending: 0, running: this.isRunning };
    }
  }
}

// Global retry service instance
export const retryService = new RetryService();

// Helper function for API health checking with fallback
export async function withReceiverHealth<T>(
  fn: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    // Simple health check - attempt the primary function
    return await fn();
  } catch (error) {
    console.warn('[withReceiverHealth] Primary function failed, using fallback:', error);
    return await fallback();
  }
}

// Helper function to queue failed API calls for retry
export async function queueFailedRequest(endpoint: string, payload: any, maxRetries: number = 5) {
  return retryService.queueRetry(endpoint, payload, maxRetries);
}