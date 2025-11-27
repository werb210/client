import React from "react";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: "100vh" }}>
      {children}
    </div>
  );
};

export default AppLayout;
