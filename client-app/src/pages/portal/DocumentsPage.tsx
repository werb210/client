import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useClientSession } from "@/state/useClientSession";
import { portalGet } from "@/api/portal";

interface PortalDocument {
  id: string;
  name: string;
  uploadedAt?: string;
}

export default function DocumentsPage() {
  const { token, applicationId } = useClientSession();

  const { data, isLoading } = useQuery<PortalDocument[]>({
    queryKey: ["portal-documents", applicationId],
    queryFn: () => portalGet(`documents/${applicationId}`, token!),
    enabled: !!token && !!applicationId
  });

  if (isLoading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Documents</h1>

      <div className="space-y-3">
        {(data ?? []).map((doc) => (
          <div
            key={doc.id}
            className="p-4 bg-white rounded shadow flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-gray-900">{doc.name}</div>
              <div className="text-sm text-gray-600">
                {doc.uploadedAt
                  ? `Uploaded ${new Date(doc.uploadedAt).toLocaleString()}`
                  : "Not uploaded"}
              </div>
            </div>
          </div>
        ))}

        {!data?.length && (
          <div className="p-4 bg-white rounded shadow text-gray-600">
            No documents available.
          </div>
        )}
      </div>
    </div>
  );
}
