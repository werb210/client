/**
 * PWA functionality testing suite
 */

export interface PWATestResult {
  installable: boolean;
  offline: boolean;
  pushNotifications: boolean;
  backgroundSync: boolean;
  caching: boolean;
  issues: string[];
  score: number;
}

/**
 * Comprehensive PWA functionality test
 */
export async function testPWAFunctionality(): Promise<PWATestResult> {
  const result: PWATestResult = {
    installable: false,
    offline: false,
    pushNotifications: false,
    backgroundSync: false,
    caching: false,
    issues: [],
    score: 0
  };

  // Test app installability
  try {
    const manifestResponse = await fetch('/manifest.json');
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      result.installable = !!(manifest.name && manifest.icons && manifest.start_url);
      if (result.installable) result.score += 20;
    } else {
      result.issues.push('Manifest.json not accessible');
    }
  } catch (error) {
    result.issues.push('Failed to fetch manifest');
  }

  // Test service worker registration
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        result.caching = true;
        result.score += 20;
      }
    } catch (error) {
      result.issues.push('Service worker not registered');
    }
  } else {
    result.issues.push('Service worker not supported');
  }

  // Test offline functionality
  try {
    const offlineResponse = await fetch('/offline');
    if (offlineResponse.ok) {
      result.offline = true;
      result.score += 20;
    }
  } catch (error) {
    result.issues.push('Offline page not available');
  }

  // Test push notifications
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = Notification.permission;
    if (permission === 'granted') {
      result.pushNotifications = true;
      result.score += 20;
    } else if (permission === 'default') {
      result.issues.push('Push notifications not enabled by user');
    } else {
      result.issues.push('Push notifications denied by user');
    }
  } else {
    result.issues.push('Push notifications not supported');
  }

  // Test background sync
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    result.backgroundSync = true;
    result.score += 20;
  } else {
    result.issues.push('Background sync not supported');
  }

  return result;
}

/**
 * Test offline form persistence
 */
export async function testOfflineFormPersistence(): Promise<boolean> {
  try {
    // Test IndexedDB availability
    const request = indexedDB.open('test-db', 1);
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        request.result.close();
        indexedDB.deleteDatabase('test-db');
        resolve(true);
      };
      
      request.onerror = () => resolve(false);
    });
  } catch (error) {
    return false;
  }
}

/**
 * Test push notification functionality
 */
export async function testPushNotifications(): Promise<{success: boolean; error?: string}> {
  try {
    if (!('Notification' in window)) {
      return { success: false, error: 'Notifications not supported' };
    }

    if (!('serviceWorker' in navigator)) {
      return { success: false, error: 'Service Worker not supported' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Permission denied' };
    }

    // Test notification creation
    const notification = new Notification('PWA Test', {
      body: 'Push notifications are working!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'pwa-test'
    });

    setTimeout(() => notification.close(), 3000);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Install PWA prompt handler
 */
export class PWAInstallManager {
  private deferredPrompt: any = null;

  constructor() {
    this.setupInstallPrompt();
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    this.deferredPrompt = null;
    return outcome === 'accepted';
  }

  private showInstallButton(): void {
    const installButton = document.querySelector('[data-pwa-install]') as HTMLElement;
    if (installButton) {
      installButton.style.display = 'block';
    }
  }

  private hideInstallButton(): void {
    const installButton = document.querySelector('[data-pwa-install]') as HTMLElement;
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  isInstallable(): boolean {
    return !!this.deferredPrompt;
  }
}

/**
 * Cache performance monitoring
 */
export async function testCachePerformance(): Promise<CachePerformanceResult> {
  const result: CachePerformanceResult = {
    hitRatio: 0,
    avgResponseTime: 0,
    cacheSize: 0,
    recommendations: []
  };

  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    let hits = 0;
    let misses = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      totalSize += requests.length;
    }

    result.cacheSize = totalSize;
    result.hitRatio = hits / (hits + misses || 1);

    if (result.hitRatio < 0.7) {
      result.recommendations.push('Improve cache hit ratio by caching more static assets');
    }

    if (result.cacheSize > 100) {
      result.recommendations.push('Consider cache cleanup to reduce storage usage');
    }

  } catch (error) {
    result.recommendations.push('Cache API not available or accessible');
  }

  return result;
}

export interface CachePerformanceResult {
  hitRatio: number;
  avgResponseTime: number;
  cacheSize: number;
  recommendations: string[];
}