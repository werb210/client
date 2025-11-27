import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppProvider } from "./state/AppContext";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import StartApplication from "./pages/StartApplication";
import NotFound from "./pages/NotFound";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apply" element={<StartApplication />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
