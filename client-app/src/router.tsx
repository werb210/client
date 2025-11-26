import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ApplyPage from "./pages/apply/ApplyPage";
import LayoutPage from "./pages/layout/LayoutPage";
import StatusPage from "./pages/status/StatusPage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </BrowserRouter>
  );
}
