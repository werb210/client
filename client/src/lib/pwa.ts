/**
 * PWA Support Library
 * Handles PWA installation, offline functionality, and push notifications
 */

import { setSafeHtml } from './safeHtml';

const hasWindow = typeof window !== 'undefined';
const hasDocument = typeof document !== 'undefined';
const hasNavigator = typeof navigator !== 'undefined';
const hasIndexedDB = typeof indexedDB !== 'undefined';
const hasServiceWorker = hasNavigator && 'serviceWorker' in navigator;
const hasNotifications = hasWindow && 'Notification' in window;
const hasAtob = hasWindow && typeof window.atob === 'function';
const isBrowser = hasWindow && hasDocument;

// PWA Installation Support
export class PWAInstaller {
  private deferredPrompt: any = null;
  private isInstalled = false;

  constructor() {
    if (!isBrowser) {
      return;
    }

    this.init();
  }

  private init() {
    if (!isBrowser) {
      return;
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallPrompt();
      if (import.meta.env.DEV) {
        console.log('✅ PWA installed successfully');
      }
    });

    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }
  }

  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const result = await this.deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        if (import.meta.env.DEV) {
          console.log('✅ PWA installed successfully');
        }
        return true;
      } else {
        if (import.meta.env.DEV) {
          console.log('User dismissed PWA installation');
        }
        return false;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('PWA installation failed:', error instanceof Error ? error.message : 'Unknown error');
      }
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  private showInstallPrompt() {
    // Create install prompt UI
    if (!isBrowser) {
      return;
    }

    const existingPrompt = document.getElementById('pwa-install-prompt');
    if (existingPrompt) {
      existingPrompt.remove();
    }

    const prompt = document.createElement('div');
    prompt.id = 'pwa-install-prompt';
    prompt.className = 'fixed bottom-4 left-4 right-4 bg-teal-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
    setSafeHtml(prompt, `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
        <span class="text-sm font-medium">Install Boreal Financial app for easy access</span>
      </div>
      <div class="flex space-x-2">
        <button id="pwa-install-btn" class="bg-white text-teal-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100">
          Install
        </button>
        <button id="pwa-dismiss-btn" class="text-white/80 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `);

    document.body.appendChild(prompt);

    // Handle install button
    document.getElementById('pwa-install-btn')?.addEventListener('click', () => {
      this.installApp();
      this.hideInstallPrompt();
    });

    // Handle dismiss button
    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      this.hideInstallPrompt();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideInstallPrompt();
    }, 10000);
  }

  private hideInstallPrompt() {
    if (!isBrowser) {
      return;
    }

    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt) {
      prompt.remove();
    }
  }
}

// Offline Storage Manager
export class OfflineStorageManager {
  private dbName = 'boreal-offline-store';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    if (!hasIndexedDB) {
      return;
    }

    void this.initDB();
  }

  private async initDB(): Promise<void> {
    if (!hasIndexedDB) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('form-data')) {
          const formStore = db.createObjectStore('form-data', { keyPath: 'id' });
          formStore.createIndex('step', 'step', { unique: false });
          formStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('form-submissions')) {
          const submissionStore = db.createObjectStore('form-submissions', { keyPath: 'id' });
          submissionStore.createIndex('timestamp', 'timestamp', { unique: false });
          submissionStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('document-queue')) {
          const docStore = db.createObjectStore('document-queue', { keyPath: 'id' });
          docStore.createIndex('status', 'status', { unique: false });
          docStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('chat-messages')) {
          const chatStore = db.createObjectStore('chat-messages', { keyPath: 'id' });
          chatStore.createIndex('sessionId', 'sessionId', { unique: false });
          chatStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Save form data for offline access
  public async saveFormData(step: number, data: any): Promise<void> {
    if (!hasIndexedDB) {
      return;
    }

    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['form-data'], 'readwrite');
      const store = transaction.objectStore('form-data');

      const formData = {
        id: `step-${step}`,
        step,
        data,
        timestamp: Date.now()
      };

      const request = store.put(formData);

      request.onsuccess = () => {
        if (import.meta.env.DEV) {
          console.log(`✅ Form data saved for step ${step}`);
        }
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Retrieve form data
  public async getFormData(step: number): Promise<any> {
    if (!hasIndexedDB) {
      return null;
    }

    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['form-data'], 'readonly');
      const store = transaction.objectStore('form-data');
      const request = store.get(`step-${step}`);

      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Queue form submission for background sync
  public async queueFormSubmission(data: any, token: string): Promise<void> {
    if (!hasIndexedDB) {
      return;
    }

    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['form-submissions'], 'readwrite');
      const store = transaction.objectStore('form-submissions');

      const submission = {
        id: `submission-${Date.now()}`,
        data,
        token,
        status: 'pending',
        timestamp: Date.now()
      };

      const request = store.add(submission);

      request.onsuccess = () => {
        if (import.meta.env.DEV) {
          console.log('✅ Form submission queued for sync');
        }
        // Register background sync
        if (hasServiceWorker) {
          navigator.serviceWorker.ready.then((registration) => {
            if ('sync' in registration) {
              return (registration as any).sync.register('form-submission');
            }
            return undefined;
          });
        }
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Save chat messages for offline access
  public async saveChatMessage(sessionId: string, message: any): Promise<void> {
    if (!hasIndexedDB) {
      return;
    }

    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chat-messages'], 'readwrite');
      const store = transaction.objectStore('chat-messages');

      const chatMessage = {
        id: `message-${Date.now()}-${Math.random()}`,
        sessionId,
        message,
        timestamp: Date.now()
      };

      const request = store.add(chatMessage);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get chat history
  public async getChatHistory(sessionId: string): Promise<any[]> {
    if (!hasIndexedDB) {
      return [];
    }

    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chat-messages'], 'readonly');
      const store = transaction.objectStore('chat-messages');
      const index = store.index('sessionId');
      const request = index.getAll(sessionId);

      request.onsuccess = () => {
        const messages = request.result.sort((a, b) => a.timestamp - b.timestamp);
        resolve(messages.map(m => m.message));
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Clear all offline data
  public async clearOfflineData(): Promise<void> {
    if (!hasIndexedDB) {
      return;
    }

    if (!this.db) await this.initDB();

    const stores = ['form-data', 'form-submissions', 'document-queue', 'chat-messages'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    if (import.meta.env.DEV) {
      console.log('✅ All offline data cleared');
    }
  }
}

// Push Notification Manager
export class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    if (!hasServiceWorker || !hasNotifications) {
      return;
    }

    this.init();
  }

  private async init() {
    if (!hasServiceWorker) {
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
    } catch (error) {
      // Service worker not ready, fail silently
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!hasNotifications) {
      console.log('This environment does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  public async subscribeToPush(): Promise<PushSubscription | null> {
    if (!hasServiceWorker || !hasNotifications) {
      return null;
    }

    if (!this.registration) {
      try {
        this.registration = await navigator.serviceWorker.ready;
      } catch (error) {
        console.error('Service worker registration not available', error);
        return null;
      }
    }

    if (!this.registration) {
      console.error('Service worker registration not available');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'BMxYvUFeXbCxNMrWKlCPdMF5vR1D5i2tQl0Ug9F2q3gK4J9rK2l5M8nO3PaQs7RvTx2Uv6W8y0Z1'
        ) as unknown as BufferSource
      });

      console.log('Push subscription successful:', subscription);
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    if (!hasServiceWorker) {
      return;
    }

    try {
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    if (!hasAtob) {
      return new Uint8Array();
    }

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  public hasPermission(): boolean {
    return hasNotifications && Notification.permission === 'granted';
  }
}

// Network Status Manager
export class NetworkStatusManager {
  private isOnline = hasNavigator ? navigator.onLine : false;
  private callbacks: Array<(online: boolean) => void> = [];

  constructor() {
    if (!isBrowser || !hasNavigator) {
      return;
    }

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyCallbacks(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyCallbacks(false);
    });
  }

  public isConnected(): boolean {
    return this.isOnline;
  }

  public onStatusChange(callback: (online: boolean) => void): void {
    this.callbacks.push(callback);
  }

  private notifyCallbacks(online: boolean): void {
    this.callbacks.forEach(callback => callback(online));
  }
}

// Initialize PWA features
export const initializePWA = () => {
  if (!isBrowser) {
    return {
      installer: new PWAInstaller(),
      storage: new OfflineStorageManager(),
      pushManager: new PushNotificationManager(),
      networkManager: new NetworkStatusManager(),
    };
  }

  // Register service worker ONLY in production to avoid caching issues
  if (hasServiceWorker) {
    const dev = import.meta.env.MODE !== "production";
    if (dev) {
      // Dev/staging: DISABLE service worker to prevent stale cache issues and clear caches
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      caches?.keys?.().then((keys) => keys.forEach((k) => caches.delete(k)));
      console.info("[PWA] SW disabled in dev; caches cleared");
    } else {
      // Production only
      window.addEventListener('load', async () => {
        try {
          // Check if service worker file exists first
          const response = await fetch('/service-worker.js', { method: 'HEAD' });
          if (!response.ok) {
            console.log('Service worker file not found, skipping registration');
            return;
          }

          const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
          });

          if (import.meta.env.DEV) {
            console.log('✅ Service worker registered successfully');
          }

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (import.meta.env.DEV) {
            console.log('Message from service worker:', event.data);
          }

          if (event.data.type === 'SYNC_SUCCESS') {
            // Handle successful background sync
            if (import.meta.env.DEV) {
              console.log('Background sync completed');
            }
          }
        });
        
        } catch (error: unknown) {
          if (import.meta.env.DEV) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn('Service worker registration failed:', errorMessage);
          }
        }
      });
    }
  } else {
    if (import.meta.env.DEV) {
      console.log('Service workers not supported in this browser');
    }
  }

  // Initialize PWA components
  const installer = new PWAInstaller();
  const storage = new OfflineStorageManager();
  const pushManager = new PushNotificationManager();
  const networkManager = new NetworkStatusManager();

  // Show network status
  networkManager.onStatusChange((online) => {
    if (!hasDocument) {
      return;
    }

    const statusElement = document.getElementById('network-status');
    if (statusElement) {
      statusElement.textContent = online ? 'Online' : 'Offline';
      statusElement.className = online ? 'text-green-600' : 'text-red-600';
    }
  });

  return {
    installer,
    storage,
    pushManager,
    networkManager
  };
};