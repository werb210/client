import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Client App Running</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
