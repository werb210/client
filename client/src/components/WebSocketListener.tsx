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
    // DISABLED: WebSocket listener causing connection errors
    // The server uses Socket.IO for real-time communication, not raw WebSocket
    // This component was causing repeated connection attempts to non-existent /ws endpoint
    
    console.log('[WebSocket] Legacy WebSocket listener disabled - using Socket.IO for real-time features');
    
    // Early return to prevent WebSocket connection attempts
    return;
        
        ws.onopen = () => {
          // // console.log('[WebSocket] Connected to lender products updates'); // Suppressed for clean console
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'lender_products.updated') {
              // console.log('[WebSocket] Lender products updated - invalidating cache');
              
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
            // console.log('[WebSocket] Connection closed, code:', event.code);
          } catch (e) {
            // Silently ignore WebSocket close logging failures
          }
          
          // DISABLED: Auto-reconnect for cache-only system
          // if (event.code !== 1000) {
          //   setTimeout(() => {
          //     // console.log('[WebSocket] Attempting to reconnect...');
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