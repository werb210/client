import { useEffect } from "react";
import AppRouter from "../router/AppRouter";
import { Header } from "../components/Header";
import { ChatWidget } from "../components/ChatWidget";
import { OfflineBanner } from "../components/OfflineBanner";
import { ErrorBoundary } from "../utils/errorBoundary";
import { ClientProfileStore } from "../state/clientProfiles";

export default function App() {
  useEffect(() => {
    ClientProfileStore.clearPortalSessions();
    const handleVisibility = () => {
      if (document.hidden) {
        ClientProfileStore.clearPortalSessions();
      }
    };
    const handlePageHide = () => {
      ClientProfileStore.clearPortalSessions();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfflineBanner />
      <main className="flex-1">
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </main>
      <ChatWidget />
    </div>
  );
}
