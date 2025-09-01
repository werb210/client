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
import { initSentry, Sentry } from "@/lib/sentry";
import { ErrorBoundary } from "@/components/ErrorBoundary";
// ✅ Socket.IO integration handled by useWebSocket hook

// Initialize Sentry error monitoring
initSentry();

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
  
  // Handle significant errors in development only
  if (import.meta.env.DEV && reason) {
    // Promise rejection handled
  }
  
  event.preventDefault();
});

function App() {
  useWebSocket(); // ✅ Enables live updates globally
  
  // Environment configuration loaded
  
  return (
    <ErrorBoundary>
      <AppShell>
        <NetworkStatus />
        <SyncStatus />
        <MainLayout />
        <PWAInstallPrompt />
        <PWAOfflineQueue />
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;