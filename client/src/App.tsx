/**
 * V2 Application - Using V1 Design System
 * 
 * This application now uses the proven V1 layout and design patterns
 * extracted into the v2-design-system for consistency and reliability.
 * 
 * ✅ V1 Components Used: SideBySideApplication, Step routes
 * ❌ V2 Legacy Archived: ComprehensiveApplication, individual Step forms
 */

import { AppShell } from "@/v2-design-system/AppShell";
import { MainLayout } from "@/v2-design-system/MainLayout";
import { PWAInstallPrompt, NetworkStatus, SyncStatus } from "@/components/PWAInstallPrompt";
import { PWAOfflineQueue } from "@/components/PWAOfflineQueue";
import { useWebSocket } from "@/hooks/useWebSocket";
// DISABLED: WebSocketListener causing connection errors - using Socket.IO instead
// import { WebSocketListener } from "@/components/WebSocketListener";

// Enhanced promise rejection handler with better filtering
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  
  // Filter out common safe rejections that don't need logging
  if (reason && typeof reason === 'object') {
    const message = reason.message || String(reason);
    const safeErrors = [
      'AbortError',
      'Load was cancelled',
      'Navigation cancelled', 
      'The user aborted a request',
      'signal is aborted without reason',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured'
    ];
    
    if (safeErrors.some(safe => message.includes(safe))) {
      event.preventDefault();
      return;
    }
  }
  
  // Only log significant errors in development
  if (import.meta.env.DEV && reason) {
    console.warn('[App] Promise rejection:', reason.message || reason);
  }
  
  event.preventDefault();
});

function App() {
  useWebSocket(); // ✅ Enables live updates globally
  
  // Environment configuration loaded
  
  return (
    <AppShell>
      <NetworkStatus />
      <SyncStatus />
      <MainLayout />
      <PWAInstallPrompt />
      <PWAOfflineQueue />
    </AppShell>
  );
}

export default App;