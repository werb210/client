import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useClientSession } from "@/state/useClientSession";
import { portalGet } from "@/api/portal";

export default function Dashboard() {
  const { token, applicationId } = useClientSession();

  const { data, isLoading } = useQuery({
    queryKey: ["portal-dashboard", applicationId],
    queryFn: () => portalGet(`dashboard/${applicationId}`, token!),
    enabled: !!token && !!applicationId
  });

  if (isLoading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Welcome Back</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <div className="text-gray-600 text-sm">Application Status</div>
          <div className="text-xl font-bold">{data?.status ?? "-"}</div>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <div className="text-gray-600 text-sm">Documents Uploaded</div>
          <div className="text-xl font-bold">{data?.documentCount ?? 0}</div>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <div className="text-gray-600 text-sm">Messages</div>
          <div className="text-xl font-bold">{data?.unreadMessages ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
