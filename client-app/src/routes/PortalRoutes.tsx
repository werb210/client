import { Outlet } from "react-router-dom";
import SessionGuard from "../components/SessionGuard";

export default function PortalRoutes() {
  return (
    <SessionGuard>
      <Outlet />
    </SessionGuard>
  );
}
