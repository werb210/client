import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useClientSession } from "@/state/useClientSession";
import { portalGet } from "@/api/portal";

interface PortalMessage {
  id: string;
  sender: string;
  body: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { token, applicationId } = useClientSession();

  const { data, isLoading } = useQuery<PortalMessage[]>({
    queryKey: ["portal-messages", applicationId],
    queryFn: () => portalGet(`messages/${applicationId}`, token!),
    enabled: !!token && !!applicationId
  });

  if (isLoading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Messages</h1>

      <div className="space-y-3">
        {(data ?? []).map((msg) => (
          <div key={msg.id} className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-600 mb-1">
              {msg.sender} — {new Date(msg.createdAt).toLocaleString()}
            </div>
            <div className="text-gray-900 whitespace-pre-wrap">{msg.body}</div>
          </div>
        ))}

        {!data?.length && (
          <div className="p-4 bg-white rounded shadow text-gray-600">
            No messages yet.
          </div>
        )}
      </div>
    </div>
  );
}
