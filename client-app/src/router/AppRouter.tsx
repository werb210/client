import { Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { ApplyPage } from "../pages/ApplyPage";
import { ResumePage } from "../pages/ResumePage";
import { StatusPage } from "../pages/StatusPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/apply/*" element={<ApplyPage />} />
      <Route path="/resume" element={<ResumePage />} />
      <Route path="/status" element={<StatusPage />} />
    </Routes>
  );
}
