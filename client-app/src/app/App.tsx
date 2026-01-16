import { AppRouter } from "../router/AppRouter";
import { Header } from "../components/Header";
import { ChatWidget } from "../components/ChatWidget";
import { OfflineBanner } from "../components/OfflineBanner";
import { ErrorBoundary } from "../utils/errorBoundary";

export default function App() {
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
