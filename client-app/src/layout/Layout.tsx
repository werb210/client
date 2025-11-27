import React from "react";
import "../styles/global.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ padding: "20px" }}>
      {children}
    </div>
  );
};

export default Layout;
