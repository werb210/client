import React from "react";
import { createRoot } from "react-dom/client";
// import App from "./App";
import "./index.css";

const SimpleApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#003D7A', fontSize: '32px', marginBottom: '16px' }}>
        Boreal Financial - Test Page
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '16px' }}>
        React application is working correctly!
      </p>
      <div style={{ marginTop: '20px' }}>
        <a href="/register" style={{ 
          background: '#0066cc', 
          color: 'white', 
          padding: '10px 20px', 
          textDecoration: 'none', 
          borderRadius: '4px',
          marginRight: '10px'
        }}>
          Register
        </a>
        <a href="/login" style={{ 
          background: '#666', 
          color: 'white', 
          padding: '10px 20px', 
          textDecoration: 'none', 
          borderRadius: '4px'
        }}>
          Login
        </a>
      </div>
    </div>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<SimpleApp />);
} else {
  console.error("Root element not found");
}
