/**
 * PWA Custom Hooks
 * React hooks for PWA functionality including offline storage and notifications
 */

import { useState, useEffect, useCallback } from 'react';
import { OfflineStorageManager, PushNotificationManager, NetworkStatusManager } from '@/lib/pwa';

// Singleton instances
let storageManager: OfflineStorageManager | null = null;
let pushManager: PushNotificationManager | null = null;
let networkManager: NetworkStatusManager | null = null;

function getStorageManager() {
  if (!storageManager) {
    storageManager = new OfflineStorageManager();
  }
  return storageManager;
}

function getPushManager() {
  if (!pushManager) {
    pushManager = new PushNotificationManager();
  }
  return pushManager;
}

function getNetworkManager() {
  if (!networkManager) {
    networkManager = new NetworkStatusManager();
  }
  return networkManager;
}

// Hook for offline form data management
export function useOfflineForm(step: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storage = getStorageManager();

  const saveFormData = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await storage.saveFormData(step, data);
      console.log(`Form data saved offline for step ${step}`);
    } catch (err) {
      setError('Failed to save form data offline');
      console.error('Offline save error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [step, storage]);

  const loadFormData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await storage.getFormData(step);
      return data;
    } catch (err) {
      setError('Failed to load form data from offline storage');
      console.error('Offline load error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [step, storage]);

  const queueSubmission = useCallback(async (data: any, token: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await storage.queueFormSubmission(data, token);
      console.log('Form submission queued for background sync');
    } catch (err) {
      setError('Failed to queue form submission');
      console.error('Queue submission error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  return {
    saveFormData,
    loadFormData,
    queueSubmission,
    isLoading,
    error
  };
}

// Hook for network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const networkManager = getNetworkManager();

  useEffect(() => {
    const handleStatusChange = (online: boolean) => {
      setIsOnline(online);
    };

    networkManager.onStatusChange(handleStatusChange);
    setIsOnline(networkManager.isConnected());

    return () => {
      // Note: NetworkStatusManager doesn't have removeListener method
      // This is acceptable as it's a singleton and will persist
    };
  }, [networkManager]);

  return { isOnline };
}

// Hook for push notifications
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const pushManager = getPushManager();

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    setHasPermission(pushManager.hasPermission());
  }, [pushManager]);

  const requestPermission = useCallback(async () => {
    const granted = await pushManager.requestPermission();
    setHasPermission(granted);
    return granted;
  }, [pushManager]);

  const subscribe = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      const subscription = await pushManager.subscribeToPush();
      setIsSubscribed(!!subscription);
      return !!subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  }, [pushManager, hasPermission, requestPermission]);

  return {
    isSupported,
    hasPermission,
    isSubscribed,
    requestPermission,
    subscribe
  };
}

// Hook for offline chat functionality
export function useOfflineChat(sessionId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storage = getStorageManager();

  const saveChatMessage = useCallback(async (message: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await storage.saveChatMessage(sessionId, message);
    } catch (err) {
      setError('Failed to save chat message offline');
      console.error('Chat save error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, storage]);

  const loadChatHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const history = await storage.getChatHistory(sessionId);
      return history;
    } catch (err) {
      setError('Failed to load chat history');
      console.error('Chat load error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, storage]);

  return {
    saveChatMessage,
    loadChatHistory,
    isLoading,
    error
  };
}

// Hook for PWA installation
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    } finally {
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  }, [deferredPrompt]);

  return {
    canInstall,
    isInstalled,
    install
  };
}

// Hook for service worker communication
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsRegistered(true);
      });

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from service worker:', event.data);
        
        // Handle different message types
        if (event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  const updateApp = useCallback(() => {
    if (updateAvailable) {
      window.location.reload();
    }
  }, [updateAvailable]);

  const sendMessage = useCallback((message: any) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }, []);

  return {
    isRegistered,
    updateAvailable,
    updateApp,
    sendMessage
  };
}