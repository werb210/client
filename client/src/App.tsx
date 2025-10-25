/**
 * V2 Application - Using V1 Design System
 * 
 * This application now uses the proven V1 layout and design patterns
 * extracted into the v2-design-system for consistency and reliability.
 * 
 * ✅ V1 Components Used: SideBySideApplication, Step routes
 * ❌ V2 Legacy Archived: ComprehensiveApplication, individual Step forms
 */

import { useEffect } from "react";

import { AppShell } from "@/v2-design-system/AppShell";
import { MainLayout } from "@/v2-design-system/MainLayout";
import { PWAInstallPrompt, NetworkStatus, SyncStatus } from "@/components/PWAInstallPrompt";
import { PWAOfflineQueue } from "@/components/PWAOfflineQueue";
import { useWebSocket } from "@/hooks/useWebSocket";
import { initSentry } from "@/lib/sentry";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CookieBanner from "@/components/CookieBanner";
// ✅ Socket.IO integration handled by useWebSocket hook

const isBrowser = typeof window !== 'undefined';

// Initialize Sentry error monitoring when the browser runtime is available
if (isBrowser) {
  initSentry();
}

function App() {
  useWebSocket(); // ✅ Enables live updates globally

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;

      if (reason && typeof reason === 'object') {
        const message = (reason as { message?: string }).message || String(reason);
        const safeErrors = [
          'AbortError',
          'Load was cancelled',
          'Navigation cancelled',
          'The user aborted a request',
          'signal is aborted without reason',
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
        ];

        if (safeErrors.some((safe) => message.includes(safe))) {
          event.preventDefault();
          return;
        }
      }

      if (import.meta.env.DEV && reason) {
        // Promise rejection handled
      }

      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    return () => {
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AppShell>
        <NetworkStatus />
        <SyncStatus />
        <MainLayout />
        <PWAInstallPrompt />
        <PWAOfflineQueue />
      </AppShell>
      <CookieBanner />
    </ErrorBoundary>
  );
}

export default App;