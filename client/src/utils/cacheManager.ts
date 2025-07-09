/**
 * Cache Management Utility
 * Handles comprehensive cache clearing and state verification
 */

export interface CacheStatus {
  localStorage: number;
  sessionStorage: number;
  cookies: number;
  indexedDB: string[];
  applicationId: string | null;
  tokens: string[];
}

export class CacheManager {
  /**
   * Get comprehensive cache status
   */
  static async getCacheStatus(): Promise<CacheStatus> {
    const status: CacheStatus = {
      localStorage: Object.keys(localStorage).length,
      sessionStorage: Object.keys(sessionStorage).length,
      cookies: document.cookie.split(';').filter(c => c.trim()).length,
      indexedDB: [],
      applicationId: localStorage.getItem('applicationId'),
      tokens: []
    };

    // Check for authentication tokens
    const tokenKeys = Object.keys(localStorage).filter(key => 
      key.includes('token') || key.includes('auth') || key.includes('session')
    );
    status.tokens = tokenKeys.map(key => `${key}: ${localStorage.getItem(key)?.substring(0, 20)}...`);

    // Check IndexedDB databases
    try {
      const databases = await indexedDB.databases();
      status.indexedDB = databases.map(db => db.name || 'unnamed');
    } catch (error) {
      console.warn('Could not enumerate IndexedDB databases:', error);
    }

    return status;
  }

  /**
   * Clear all localStorage data
   */
  static clearLocalStorage(): void {
    const keys = Object.keys(localStorage);
    localStorage.clear();
    console.log(`🗑️ Cleared ${keys.length} localStorage items:`, keys);
  }

  /**
   * Clear all sessionStorage data
   */
  static clearSessionStorage(): void {
    const keys = Object.keys(sessionStorage);
    sessionStorage.clear();
    console.log(`🗑️ Cleared ${keys.length} sessionStorage items:`, keys);
  }

  /**
   * Clear all cookies
   */
  static clearCookies(): void {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name) {
        // Clear for current domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        // Clear for parent domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.boreal.financial`;
      }
    });
    console.log(`🗑️ Cleared ${cookies.length} cookies`);
  }

  /**
   * Clear IndexedDB databases
   */
  static async clearIndexedDB(): Promise<void> {
    try {
      const databases = await indexedDB.databases();
      const deletePromises = databases.map(db => {
        if (db.name) {
          return new Promise<void>((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase(db.name!);
            deleteReq.onsuccess = () => resolve();
            deleteReq.onerror = () => reject(deleteReq.error);
          });
        }
        return Promise.resolve();
      });

      await Promise.all(deletePromises);
      console.log(`🗑️ Cleared ${databases.length} IndexedDB databases:`, databases.map(db => db.name));
    } catch (error) {
      console.warn('Could not clear IndexedDB:', error);
    }
  }

  /**
   * Comprehensive cache clear
   */
  static async clearAllCache(): Promise<void> {
    console.log('🧹 COMPREHENSIVE CACHE CLEARING');
    console.log('================================');

    const beforeStatus = await this.getCacheStatus();
    console.log('📊 Before clearing:', beforeStatus);

    // Clear all storage types
    this.clearLocalStorage();
    this.clearSessionStorage();
    this.clearCookies();
    await this.clearIndexedDB();

    // Clear service worker cache if available
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log(`🗑️ Cleared ${cacheNames.length} service worker caches`);
      } catch (error) {
        console.warn('Could not clear service worker caches:', error);
      }
    }

    const afterStatus = await this.getCacheStatus();
    console.log('📊 After clearing:', afterStatus);
    console.log('✅ Cache clearing complete');
  }

  /**
   * Verify clean state
   */
  static async verifyCleanState(): Promise<boolean> {
    const status = await this.getCacheStatus();
    const isClean = status.localStorage === 0 && 
                   status.sessionStorage === 0 && 
                   status.cookies === 0 && 
                   status.indexedDB.length === 0 &&
                   status.applicationId === null &&
                   status.tokens.length === 0;

    console.log('🔍 Clean state verification:', isClean ? '✅ CLEAN' : '❌ DIRTY');
    if (!isClean) {
      console.log('💡 Remaining items:', status);
    }

    return isClean;
  }
}

/**
 * Integration verification utilities
 */
export class IntegrationVerifier {
  /**
   * Test staff portal authentication endpoint
   */
  static async testStaffAuth(): Promise<boolean> {
    try {
      const response = await fetch('https://staff.boreal.financial/api/rbac/auth/me', {
        method: 'GET',
        credentials: 'include'
      });

      console.log('🔐 Staff auth test:', response.status, response.statusText);
      
      if (response.status === 401) {
        console.log('✅ Expected 401 - Staff auth working correctly (unauthenticated)');
        return true;
      } else if (response.status === 200) {
        console.log('✅ Staff auth returned 200 - User is authenticated');
        return true;
      } else {
        console.log('❌ Unexpected staff auth response:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Staff auth test failed:', error);
      return false;
    }
  }

  /**
   * Test client app initialization
   */
  static async testClientInit(): Promise<boolean> {
    try {
      // Check if React app is properly initialized
      const reactRoot = document.getElementById('root');
      if (!reactRoot || !reactRoot.innerHTML) {
        console.log('❌ React app not initialized');
        return false;
      }

      // Check for cache bypass - simple storage check
      const isStorageEmpty = localStorage.length === 0 && sessionStorage.length === 0;
      const areCookiesEmpty = document.cookie.length === 0;

      if (isStorageEmpty && areCookiesEmpty) {
        console.log('✅ CACHE BYPASS - Clean state detected');
        console.log('✅ localStorage: empty');
        console.log('✅ sessionStorage: empty');
        console.log('✅ cookies: empty');
      } else {
        console.log('⚠️ Storage not empty - cached data present');
      }

      console.log('✅ Client app initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Client init test failed:', error);
      return false;
    }
  }

  /**
   * Comprehensive integration check
   */
  static async runIntegrationCheck(): Promise<void> {
    console.log('🔍 INTEGRATION VERIFICATION');
    console.log('===========================');

    const cleanState = await CacheManager.verifyCleanState();
    const staffAuth = await this.testStaffAuth();
    const clientInit = await this.testClientInit();

    console.log('📊 Integration Results:');
    console.log(`   Clean State: ${cleanState ? '✅' : '❌'}`);
    console.log(`   Staff Auth: ${staffAuth ? '✅' : '❌'}`);
    console.log(`   Client Init: ${clientInit ? '✅' : '❌'}`);

    if (cleanState && staffAuth && clientInit) {
      console.log('🎉 All integration checks passed!');
    } else {
      console.log('⚠️ Some integration checks failed - review above');
    }
  }
}

// Make utilities available on window for console access
if (typeof window !== 'undefined') {
  (window as any).CacheManager = CacheManager;
  (window as any).IntegrationVerifier = IntegrationVerifier;
}