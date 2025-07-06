/**
 * Cached Data Warning Banner
 * Shows non-blocking banner when using cached product list
 */

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface CachedDataBannerProps {
  isVisible: boolean;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function CachedDataBanner({ 
  isVisible, 
  message, 
  onRetry, 
  isRetrying = false 
}: CachedDataBannerProps) {
  if (!isVisible) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50 text-orange-800">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="ml-4 border-orange-300 text-orange-800 hover:bg-orange-100"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </>
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}