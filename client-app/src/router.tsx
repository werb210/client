import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Apply from "./pages/Apply";
import Status from "./pages/Status";
import AppLayout from "./layout/AppLayout";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default Router;
