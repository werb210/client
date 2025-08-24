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
    // DISABLED: All WebSocket/Socket.IO connections causing console errors
    // Using HTTP polling for all real-time features instead
    
    console.log('[WebSocket] All real-time connections disabled - using HTTP polling');
    
    // No connections attempted to prevent console errors
  }, [queryClient]);

  // This component doesn't render anything
  return null;
}