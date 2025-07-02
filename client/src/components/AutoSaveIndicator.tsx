import React from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AutoSaveIndicatorProps {
  status: 'saved' | 'saving' | 'error' | null;
  lastSaveTime: string;
}

export function AutoSaveIndicator({ status, lastSaveTime }: AutoSaveIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500">
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && lastSaveTime && (
        <>
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span className="hidden sm:inline">Saved {lastSaveTime}</span>
          <span className="sm:hidden">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3 h-3 text-red-500" />
          <span>Save failed</span>
        </>
      )}
      {status === null && (
        <span className="text-gray-400">Auto-save enabled</span>
      )}
    </div>
  );
}