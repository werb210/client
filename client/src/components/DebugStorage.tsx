import { useEffect, useState } from 'react';

export function DebugStorage() {
  const [storageInfo, setStorageInfo] = useState<any>({});

  useEffect(() => {
    const checkStorage = () => {
      const info = {
        timestamp: new Date().toISOString(),
        localStorage: {
          'bf:step1-autosave': localStorage.getItem('bf:step1-autosave'),
          'bf:intake': localStorage.getItem('bf:intake'),
          'borealCookiePreferences': localStorage.getItem('borealCookiePreferences'),
          'cacheCleanupCompleted': localStorage.getItem('cacheCleanupCompleted'),
        },
        cookies: {
          'borealCookieConsent': document.cookie.includes('borealCookieConsent'),
        },
        sessionStorage: {
          'bf:intake': sessionStorage.getItem('bf:intake'),
        }
      };
      setStorageInfo(info);
      console.log('🔍 [DEBUG] Storage check:', info);
    };

    // Check immediately
    checkStorage();

    // Check every 5 seconds
    const interval = setInterval(checkStorage, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 bg-black text-white p-2 text-xs max-w-md z-50">
      <div className="font-bold">Debug Storage:</div>
      <div>Autosave: {storageInfo.localStorage?.['bf:step1-autosave'] ? '✅' : '❌'}</div>
      <div>Intake: {storageInfo.localStorage?.['bf:intake'] ? '✅' : '❌'}</div>
      <div>Cookie Consent: {storageInfo.cookies?.borealCookieConsent ? '✅' : '❌'}</div>
      <div>Last Check: {new Date(storageInfo.timestamp).toLocaleTimeString()}</div>
    </div>
  );
}