import React, { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useClientSession } from "@/state/useClientSession";
import PortalSidebar from "@/components/portal/PortalSidebar";

export default function ClientPortal() {
  const { token } = useClientSession();

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <PortalSidebar />

      <main className="flex-1 overflow-y-auto p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
