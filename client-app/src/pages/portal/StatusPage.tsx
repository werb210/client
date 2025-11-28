import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useClientSession } from "@/state/useClientSession";
import { portalGet } from "@/api/portal";

interface StatusUpdate {
  label: string;
  timestamp: string;
}

export default function StatusPage() {
  const { token, applicationId } = useClientSession();

  const { data, isLoading } = useQuery<StatusUpdate[]>({
    queryKey: ["portal-status", applicationId],
    queryFn: () => portalGet(`status/${applicationId}`, token!),
    enabled: !!token && !!applicationId
  });

  if (isLoading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Application Status
      </h1>

      <div className="space-y-3">
        {(data ?? []).map((item, idx) => (
          <div key={idx} className="p-4 bg-white rounded shadow">
            <div className="font-semibold text-gray-900">{item.label}</div>
            <div className="text-sm text-gray-600">
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        ))}

        {!data?.length && (
          <div className="p-4 bg-white rounded shadow text-gray-600">
            No status updates yet.
          </div>
        )}
      </div>
    </div>
  );
}
