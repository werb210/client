import React from "react";
import ReactDOM from "react-dom/client";

import AppLayout from "layout/AppLayout";
import App from "App";
import { AppProvider } from "state/AppContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <AppLayout>
        <App />
      </AppLayout>
    </AppProvider>
  </React.StrictMode>
);
