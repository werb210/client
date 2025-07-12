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
              queryClient.invalidateQueries({ queryKey: ['lender-products'] }).catch(() => {
                // Silently ignore query invalidation errors
              });
              
              toast({
                title: 'Lender Products Updated',
                description: 'New product data available. Refreshing...',
                variant: 'default'
              });
            }
          } catch (error) {
            // Silently ignore WebSocket message parsing errors
          }
        };
        
        ws.onerror = (error) => {
          try {
            console.warn('[WebSocket] Connection error:', error);
          } catch (e) {
            // Silently ignore WebSocket error logging failures
          }
        };
        
        ws.onclose = (event) => {
          try {
            console.log('[WebSocket] Connection closed, code:', event.code);
          } catch (e) {
            // Silently ignore WebSocket close logging failures
          }
          
          // DISABLED: Auto-reconnect for cache-only system
          // if (event.code !== 1000) {
          //   setTimeout(() => {
          //     console.log('[WebSocket] Attempting to reconnect...');
          //     setupWebSocketListener();
          //   }, 5000);
          // }
        };
        
      } catch (error) {
        console.warn('[WebSocket] Failed to setup listener:', error);
      }
    };

    // Initialize WebSocket connection
    setupWebSocketListener();
    
    // Cleanup function
    return () => {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close(1000, 'Component unmounting');
        }
      } catch (error) {
        // Silently ignore WebSocket cleanup errors
      }
    };
  }, [queryClient]);

  // This component doesn't render anything
  return null;
}