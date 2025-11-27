import React from "react";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <h1>Boreal Financial</h1>
      </header>

      <main style={{ flex: 1, padding: "1rem" }}>
        {children}
      </main>

      <footer style={{ padding: "1rem", borderTop: "1px solid #ddd", textAlign: "center" }}>
        © {new Date().getFullYear()} Boreal Financial
      </footer>
    </div>
  );
};

export default AppLayout;
