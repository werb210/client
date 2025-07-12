import React from 'react';
import { getFetchWindowInfo, formatMSTTime } from '../utils/fetchWindow';

interface FetchWindowDebugPanelProps {
  lastFetchTime?: Date | null;
  cachedProductCount?: number;
  cacheSource?: string;
}

/**
 * Debug panel showing fetch window status and cache information
 * Useful for development and testing the scheduled fetch logic
 */
export function FetchWindowDebugPanel({ 
  lastFetchTime, 
  cachedProductCount = 0, 
  cacheSource = 'unknown' 
}: FetchWindowDebugPanelProps) {
  const windowInfo = getFetchWindowInfo();
  
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
        
        {/* Cache Info */}
        <div className="border-t border-slate-300 dark:border-slate-600 pt-2 mt-2">
          <div className="text-slate-600 dark:text-slate-400">
            📦 Cached products: {cachedProductCount}
          </div>
          {lastFetchTime && (
            <div className="text-slate-600 dark:text-slate-400">
              💾 Last fetch: {formatMSTTime(lastFetchTime)}
            </div>
          )}
          <div className="text-slate-600 dark:text-slate-400">
            🔗 Cache source: {cacheSource}
          </div>
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