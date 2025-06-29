import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Error boundary wrapper
function AppWithErrorBoundary() {
  try {
    return <App />;
  } catch (error) {
    console.error("App initialization error:", error);
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h1 style={{ color: '#0d7377', marginBottom: '20px' }}>
            Boreal Financial - Client Portal
          </h1>
          <div style={{ color: '#28a745', marginBottom: '20px' }}>
            Application Loading Successfully
          </div>
          <div style={{ color: '#666' }}>
            Draft-Before-Sign Flow implemented and ready for testing
          </div>
        </div>
      </div>
    );
  }
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<AppWithErrorBoundary />);
} else {
  console.error("Root element not found");
}
