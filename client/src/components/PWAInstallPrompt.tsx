/**
 * PWA Install Prompt Component
 * Shows an install prompt banner when PWA installation is available
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('User accepted PWA installation');
      } else {
        console.log('User dismissed PWA installation');
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    } finally {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Hide for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed, dismissed, or no install prompt available
  if (isInstalled || !showPrompt || !deferredPrompt || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="bg-teal-600 text-white rounded-lg shadow-lg p-4 border border-teal-500">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Smartphone className="w-6 h-6 text-teal-100" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white">
              Install Boreal Financial
            </h3>
            <p className="text-xs text-teal-100 mt-1">
              Get quick access to your applications and receive notifications about document requirements.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-teal-200 hover:text-white transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex space-x-2 mt-3">
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-white text-teal-600 hover:bg-teal-50 flex-1"
          >
            Install App
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-teal-100 hover:text-white hover:bg-teal-700 flex-1"
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  );
}

// Network Status Indicator Component
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span>You're offline. Some features may be limited.</span>
      </div>
    </div>
  );
}

// Background Sync Status Component
export function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_SUCCESS') {
          setSyncStatus('success');
          setSyncMessage('Data synced successfully');
          
          // Hide success message after 3 seconds
          setTimeout(() => {
            setSyncStatus('idle');
            setSyncMessage('');
          }, 3000);
        } else if (event.data.type === 'SYNC_ERROR') {
          setSyncStatus('error');
          setSyncMessage('Sync failed - will retry when online');
          
          // Hide error message after 5 seconds
          setTimeout(() => {
            setSyncStatus('idle');
            setSyncMessage('');
          }, 5000);
        }
      });
    }
  }, []);

  if (syncStatus === 'idle') return null;

  const statusColors = {
    syncing: 'bg-blue-600',
    success: 'bg-green-600',
    error: 'bg-red-600'
  };

  return (
    <div className={`fixed top-16 left-4 right-4 z-40 ${statusColors[syncStatus]} text-white text-center py-2 px-4 rounded-lg shadow-lg text-sm mx-auto max-w-md`}>
      <div className="flex items-center justify-center space-x-2">
        {syncStatus === 'syncing' && (
          <div className="w-2 h-2 bg-white rounded-full animate-spin"></div>
        )}
        {syncStatus === 'success' && (
          <div className="w-2 h-2 bg-white rounded-full"></div>
        )}
        {syncStatus === 'error' && (
          <div className="w-2 h-2 bg-white rounded-full"></div>
        )}
        <span>{syncMessage}</span>
      </div>
    </div>
  );
}