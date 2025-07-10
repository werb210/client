/**
 * SignNow Iframe Component - Handles embedded signing workflow
 */

import React, { useState, useEffect } from 'react';

interface SignNowIframeProps {
  signingUrl: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function SignNowIframe({ signingUrl, onComplete, onError }: SignNowIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle SignNow iframe messages
      if (event.origin.includes('signnow.com')) {
        console.log('SignNow iframe message:', event.data);
        
        if (event.data.type === 'document_signed') {
          console.log('✅ Document signing completed');
          onComplete?.();
        } else if (event.data.type === 'error') {
          console.error('❌ SignNow error:', event.data.message);
          onError?.(event.data.message);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onComplete, onError]);

  const handleLoad = () => {
    setIsLoading(false);
    console.log('SignNow iframe loaded successfully');
  };

  const handleError = () => {
    setIsLoading(false);
    const errorMsg = 'Failed to load SignNow iframe';
    setError(errorMsg);
    console.error('❌ SignNow iframe error:', errorMsg);
    onError?.(errorMsg);
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Loading SignNow document...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
          <p className="text-sm mt-1">Try opening the signing URL in a new tab instead.</p>
        </div>
      )}
      
      <iframe
        src={signingUrl}
        width="100%"
        height="600"
        frameBorder="0"
        title="SignNow Document Signing"
        className="w-full h-[600px] border rounded-lg"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        onLoad={handleLoad}
        onError={handleError}
        allow="camera; microphone; geolocation"
      />
    </div>
  );
}