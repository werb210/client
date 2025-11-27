import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <main style={{ padding: "24px" }}>{children}</main>
      <Footer />
    </>
  );
};

export default AppLayout;
