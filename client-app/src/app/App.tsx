import { useEffect } from "react";
import AppRouter from "../router/AppRouter";
import { Header } from "../components/Header";
import { ChatWidget } from "../components/ChatWidget";
import { OfflineBanner } from "../components/OfflineBanner";
import { InstallPromptBanner } from "../components/InstallPromptBanner";
import { ErrorBoundary } from "../utils/errorBoundary";
import { SessionRefreshOverlay } from "../components/SessionRefreshOverlay";
import { useSessionRefreshing } from "../hooks/useSessionRefreshing";
import { useServiceWorkerUpdate } from "../hooks/useServiceWorkerUpdate";

export default function App() {
  const refreshing = useSessionRefreshing();
  const updateAvailable = useServiceWorkerUpdate();

  useEffect(() => {
    if (updateAvailable) {
      console.info("A new version is available.");
    }
  }, [updateAvailable]);

  if (refreshing) {
    return <SessionRefreshOverlay />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfflineBanner />
      <InstallPromptBanner />
      <main className="flex-1">
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </main>
      <ChatWidget />
    </div>
  );
}
