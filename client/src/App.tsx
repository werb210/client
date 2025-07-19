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
import { WebSocketListener } from "@/components/WebSocketListener";

function App() {
  // Verify VITE_API_BASE_URL injection
  console.log("🔧 STAFF API:", import.meta.env.VITE_API_BASE_URL);
  
  return (
    <AppShell>
      <WebSocketListener />
      <MainLayout />
    </AppShell>
  );
}

export default App;