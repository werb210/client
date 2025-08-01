/**
 * Push Notification Client Utilities
 * Handles push subscription and VAPID key conversion
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Subscribe to push notifications using VAPID public key
 */
export async function subscribeToPush(publicKey: string): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Already subscribed to push notifications');
      return existingSubscription;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    console.log('✅ Push subscription created successfully');
    return subscription;
  } catch (error) {
    console.error('❌ Push subscription failed:', error);
    return null;
  }
}

/**
 * Send subscription to server for storage
 */
export async function sendSubscriptionToServer(subscription: PushSubscription, applicationId?: string): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        applicationId: applicationId || localStorage.getItem('applicationId'),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    console.log('✅ Push subscription sent to server');
    return true;
  } catch (error) {
    console.error('❌ Failed to send subscription to server:', error);
    return false;
  }
}

/**
 * Get VAPID public key from server
 */
export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const response = await fetch('/api/vapid-public-key');
    if (!response.ok) {
      throw new Error(`Failed to get VAPID key: ${response.status}`);
    }
    
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error('❌ Failed to get VAPID public key:', error);
    return null;
  }
}

/**
 * Convert VAPID public key from base64url to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission denied');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Initialize push notifications for the application
 */
export async function initializePushNotifications(applicationId?: string): Promise<boolean> {
  try {
    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Push notifications disabled - permission not granted');
      return false;
    }

    // Get VAPID public key
    const publicKey = await getVapidPublicKey();
    if (!publicKey) {
      console.error('Push notifications disabled - VAPID key not available');
      return false;
    }

    // Subscribe to push
    const subscription = await subscribeToPush(publicKey);
    if (!subscription) {
      console.error('Push notifications disabled - subscription failed');
      return false;
    }

    // Send subscription to server
    const success = await sendSubscriptionToServer(subscription, applicationId);
    if (!success) {
      console.error('Push notifications disabled - server registration failed');
      return false;
    }

    console.log('🔔 Push notifications initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Push notification initialization failed:', error);
    return false;
  }
}