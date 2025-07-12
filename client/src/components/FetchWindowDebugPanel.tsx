import React, { useState, useEffect } from 'react';
import { getFetchWindowInfo, formatMSTTime } from '../utils/fetchWindow';
import { getCacheStats } from '../utils/lenderCache';

interface FetchWindowDebugPanelProps {
  refreshTrigger?: number;
}

/**
 * Debug panel showing fetch window status and persistent cache information
 * Useful for development and testing the scheduled fetch logic
 */
export function FetchWindowDebugPanel({ refreshTrigger }: FetchWindowDebugPanelProps) {
  const windowInfo = getFetchWindowInfo();
  const [cacheStats, setCacheStats] = useState<any>(null);
  
  useEffect(() => {
    const loadCacheStats = async () => {
      const stats = await getCacheStats();
      setCacheStats(stats);
    };
    
    loadCacheStats();
  }, [refreshTrigger]);
  
  return (
    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
        🕒 Fetch Window Debug Info
      </h3>
      
      <div className="space-y-2">
        {/* Current Status */}
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${
            windowInfo.isAllowed ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
          <span className="text-slate-700 dark:text-slate-300">
            {windowInfo.isAllowed ? '✅ API Fetch Allowed' : '❌ API Fetch Blocked'}
          </span>
        </div>
        
        {/* Reason */}
        <div className="text-slate-600 dark:text-slate-400">
          📝 {windowInfo.reason}
        </div>
        
        {/* Next Window */}
        <div className="text-slate-600 dark:text-slate-400">
          ⏰ Next window: {formatMSTTime(windowInfo.nextWindow)}
        </div>
        
        {/* Persistent Cache Info */}
        <div className="border-t border-slate-300 dark:border-slate-600 pt-2 mt-2">
          <div className="text-slate-600 dark:text-slate-400 font-medium mb-1">
            💾 IndexedDB Cache Status:
          </div>
          {cacheStats ? (
            <>
              <div className="text-slate-600 dark:text-slate-400 ml-4">
                📦 Products: {cacheStats.productCount}
              </div>
              {cacheStats.lastFetchTime && (
                <div className="text-slate-600 dark:text-slate-400 ml-4">
                  🕒 Last fetch: {formatMSTTime(cacheStats.lastFetchTime)}
                </div>
              )}
              <div className="text-slate-600 dark:text-slate-400 ml-4">
                🔗 Source: {cacheStats.source}
              </div>
              {cacheStats.cacheAge && (
                <div className="text-slate-600 dark:text-slate-400 ml-4">
                  ⏱️ Age: {Math.round(cacheStats.cacheAge / (1000 * 60))} minutes
                </div>
              )}
              <div className="text-slate-600 dark:text-slate-400 ml-4">
                ✅ Cache Status: {cacheStats.hasCache ? 'Available' : 'Empty'}
              </div>
            </>
          ) : (
            <div className="text-slate-500 dark:text-slate-500 ml-4">
              Loading cache info...
            </div>
          )}
        </div>
        
        {/* Schedule Info */}
        <div className="border-t border-slate-300 dark:border-slate-600 pt-2 mt-2">
          <div className="text-slate-600 dark:text-slate-400 font-medium">
            📅 Fetch Schedule (MST):
          </div>
          <div className="text-slate-600 dark:text-slate-400 ml-4">
            • 12:00 AM (Midnight)
          </div>
          <div className="text-slate-600 dark:text-slate-400 ml-4">
            • 12:00 PM (Noon)
          </div>
        </div>
      </div>
    </div>
  );
}