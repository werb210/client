import React from "react";
import Router from "./router";
import Layout from "./layout/Layout";

const App: React.FC = () => {
  return (
    <Layout>
      <Router />
    </Layout>
  );
};

export default App;
