import { useState, useEffect, useCallback } from 'react';
import { initializePushNotifications } from '../utils/push';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAStatus {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  serviceWorkerReady: boolean;
  pushSupported: boolean;
  pushSubscribed: boolean;
  backgroundSyncSupported: boolean;
  offlineStorageActive: boolean;
}

export function usePWAManager() {
  const [status, setStatus] = useState<PWAStatus>({
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false,
    serviceWorkerReady: false,
    pushSupported: false,
    pushSubscribed: false,
    backgroundSyncSupported: false,
    offlineStorageActive: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Check if app is installed (running in standalone mode)
  const checkInstallStatus = useCallback(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInstalled = isStandalone || isInWebAppiOS;
    
    setStatus(prev => ({ ...prev, isInstalled }));
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      if (import.meta.env.DEV) {
        console.warn('[PWA] Service workers not supported');
      }
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      
      if (import.meta.env.DEV) {
        console.log('✅ Service worker registered');
      }
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      setStatus(prev => ({ ...prev, serviceWorkerReady: true }));

      // Check background sync support
      if ('sync' in registration) {
        setStatus(prev => ({ ...prev, backgroundSyncSupported: true }));
      }

    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[PWA] Service worker registration failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, []);

  // Setup push notifications using the utility function
  const setupPushNotifications = useCallback(async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      // Push notifications not supported, fail silently
      return;
    }

    setStatus(prev => ({ ...prev, pushSupported: true }));

    try {
      const applicationId = localStorage.getItem('applicationId') || undefined;
      const success = await initializePushNotifications(applicationId);
      
      if (success) {
        setStatus(prev => ({ ...prev, pushSubscribed: true }));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[PWA] Push notification setup failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, []);

  // Initialize offline storage
  const initializeOfflineStorage = useCallback(async () => {
    try {
      // Check if IndexedDB is available
      if ('indexedDB' in window) {
        setStatus(prev => ({ ...prev, offlineStorageActive: true }));
        console.log('[PWA] Offline storage initialized');
      }
    } catch (error) {
      console.error('[PWA] Offline storage initialization failed:', error);
    }
  }, []);

  // Check offline storage
  const checkOfflineStorage = useCallback(() => {
    try {
      // Test localStorage
      localStorage.setItem('pwa-test', 'test');
      localStorage.removeItem('pwa-test');
      
      // Test IndexedDB
      if ('indexedDB' in window) {
        setStatus(prev => ({ ...prev, offlineStorageActive: true }));
      }
    } catch (error) {
      console.warn('[PWA] Offline storage check failed:', error);
    }
  }, []);

  // Install app
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      // For iOS Safari, show manual install instructions
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        alert('To install this app on iOS:\n1. Tap the Share button\n2. Select "Add to Home Screen"');
        return;
      }
      
      console.warn('[PWA] No install prompt available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] App installed');
        setStatus(prev => ({ ...prev, isInstalled: true }));
      }
      
      setDeferredPrompt(null);
      setStatus(prev => ({ ...prev, canInstall: false }));
    } catch (error) {
      console.error('[PWA] Install failed:', error);
    }
  }, [deferredPrompt]);

  // Register background sync
  const registerBackgroundSync = useCallback(async (tag: string) => {
    if (!('serviceWorker' in navigator) || !status.serviceWorkerReady) {
      console.warn('[PWA] Background sync not available');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration && registration.sync) {
        await (registration.sync as any).register(tag);
        console.log(`[PWA] Background sync registered: ${tag}`);
      }
    } catch (error) {
      console.error('[PWA] Background sync registration failed:', error);
    }
  }, [status.serviceWorkerReady]);

  // Initialize PWA features
  useEffect(() => {
    checkInstallStatus();
    checkOfflineStorage();
    registerServiceWorker();
    
    // Setup online/offline listeners
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Setup install prompt listener
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setStatus(prev => ({ ...prev, canInstall: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    // Setup push notifications when service worker is ready (no arbitrary delay)
    if (status.serviceWorkerReady) {
      setupPushNotifications();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, [checkInstallStatus, checkOfflineStorage, registerServiceWorker, setupPushNotifications]);

  return {
    status,
    installApp,
    registerBackgroundSync,
    setupPushNotifications
  };
}