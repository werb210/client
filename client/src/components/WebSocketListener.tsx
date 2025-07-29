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
    
    // Early return to prevent WebSocket connection attempts - cleanup function not needed
  }, [queryClient]);

  // This component doesn't render anything
  return null;
}