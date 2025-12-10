import { AppRouter } from "../router/AppRouter";
import { Header } from "../components/Header";
import { ChatWidget } from "../components/ChatWidget";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AppRouter />
      </main>
      <ChatWidget />
    </div>
  );
}
