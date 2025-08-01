/**
 * Push Notification Service
 * Handles web push notifications using VAPID keys
 */

import webpush from 'web-push';

// Interface for push notification payloads
export interface PushNotificationPayload {
  title: string;
  body: string;
  type?: 'general' | 'document-required' | 'agent-response' | 'application-update';
  url?: string;
  data?: Record<string, any>;
}

// Initialize VAPID keys from environment variables
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@boreal.financial';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
  console.log('✅ Push notification service initialized with VAPID keys');
} else {
  console.warn('⚠️ VAPID keys not found - push notifications will not work');
}

/**
 * Send push notification to a single subscription
 */
export async function sendClientNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
    
    console.log('✅ Push notification sent successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Push notification failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send push notifications to multiple subscriptions
 */
export async function sendBulkNotifications(
  subscriptions: Array<{ endpoint: string; keys: { p256dh: string; auth: string } }>,
  payload: PushNotificationPayload
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  if (!vapidPublicKey || !vapidPrivateKey) {
    results.errors.push('VAPID keys not configured');
    results.failed = subscriptions.length;
    return results;
  }

  const promises = subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      results.success++;
    } catch (error) {
      results.failed++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`${subscription.endpoint.substring(0, 30)}...: ${errorMsg}`);
    }
  });

  await Promise.all(promises);
  
  console.log(`📊 Bulk push results: ${results.success} sent, ${results.failed} failed`);
  return results;
}

/**
 * Pre-defined notification templates for common scenarios
 */
export const NotificationTemplates = {
  documentRequired: (documentType: string): PushNotificationPayload => ({
    title: 'Document Required',
    body: `Please upload your ${documentType} to continue your application`,
    type: 'document-required',
    url: '/step5-document-upload'
  }),

  documentRejected: (documentType: string, reason: string): PushNotificationPayload => ({
    title: 'Document Needs Attention',
    body: `Your ${documentType} requires resubmission: ${reason}`,
    type: 'document-required',
    url: '/step5-document-upload'
  }),

  agentResponse: (message?: string): PushNotificationPayload => ({
    title: 'New Message from Agent',
    body: message || 'Your agent has responded to your inquiry',
    type: 'agent-response',
    url: '/chat'
  }),

  applicationUpdate: (status: string): PushNotificationPayload => ({
    title: 'Application Update',
    body: `Your application status has been updated to: ${status}`,
    type: 'application-update',
    url: '/dashboard'
  }),

  welcomeNotification: (): PushNotificationPayload => ({
    title: 'Welcome to Boreal Financial',
    body: 'You\'ll receive important updates about your application here',
    type: 'general',
    url: '/'
  })
};

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string | null {
  return vapidPublicKey || null;
}

/**
 * Validate push subscription object
 */
export function validateSubscription(subscription: any): boolean {
  return !!(
    subscription &&
    subscription.endpoint &&
    subscription.keys &&
    subscription.keys.p256dh &&
    subscription.keys.auth
  );
}