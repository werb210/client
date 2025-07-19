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
// DISABLED: WebSocketListener causing connection errors - using Socket.IO instead
// import { WebSocketListener } from "@/components/WebSocketListener";

// Add global unhandled promise rejection handler for cleaner console output
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[App] Unhandled promise rejection prevented:', event.reason);
  // Prevent the console error from appearing
  event.preventDefault();
});

function App() {
  // Verify VITE_API_BASE_URL injection
  console.log("🔧 STAFF API:", import.meta.env.VITE_API_BASE_URL);
  console.log("🔧 ENV MODE:", import.meta.env.MODE);
  console.log("🔧 ENV DEV:", import.meta.env.DEV);
  console.log("🔧 ALL ENV VARS:", Object.keys(import.meta.env));
  
  return (
    <AppShell>
      <MainLayout />
    </AppShell>
  );
}

export default App;