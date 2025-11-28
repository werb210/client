import { Navigate, Route, Routes } from "react-router-dom";
import PortalAssistant from "../pages/PortalAssistant";
import PortalDashboard from "../pages/PortalDashboard";
import PortalMessages from "../pages/PortalMessages";

export default function PortalRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PortalDashboard />} />
      <Route path="/messages" element={<PortalMessages />} />
      <Route path="/assistant" element={<PortalAssistant />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
