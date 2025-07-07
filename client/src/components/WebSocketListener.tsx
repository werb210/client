/**
 * WebSocket Listener Component
 * Handles real-time updates for lender products via WebSocket/SSE
 */

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export function WebSocketListener() {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    let ws: WebSocket | null = null;

    const setupWebSocketListener = () => {
      // Check if WebSocket is available
      if (typeof WebSocket === 'undefined') {
        console.warn('[WebSocket] WebSocket not available in this environment');
        return;
      }

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('[WebSocket] Connected to lender products updates');
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'lender_products.updated') {
              console.log('[WebSocket] Lender products updated - invalidating cache');
              
              // Invalidate React Query cache as per specification
              queryClient.invalidateQueries({ queryKey: ['lender-products'] });
              
              toast({
                title: 'Lender Products Updated',
                description: 'New product data available. Refreshing...',
                variant: 'default'
              });
            }
          } catch (error) {
            console.warn('[WebSocket] Failed to parse message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.warn('[WebSocket] Connection error:', error);
        };
        
        ws.onclose = (event) => {
          console.log('[WebSocket] Connection closed, code:', event.code);
          
          // Attempt to reconnect after 5 seconds if not a clean close
          if (event.code !== 1000) {
            setTimeout(() => {
              console.log('[WebSocket] Attempting to reconnect...');
              setupWebSocketListener();
            }, 5000);
          }
        };
        
      } catch (error) {
        console.warn('[WebSocket] Failed to setup listener:', error);
      }
    };

    // Initialize WebSocket connection
    setupWebSocketListener();
    
    // Cleanup function
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [queryClient]);

  // This component doesn't render anything
  return null;
}