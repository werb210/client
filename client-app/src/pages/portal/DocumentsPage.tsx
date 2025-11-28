import React, { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useClientSession } from "@/state/useClientSession";
import { portalGet } from "@/api/portal";

export default function DocumentsPage() {
  const { token, applicationId } = useClientSession();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["portal-documents", applicationId],
    queryFn: () => portalGet(`documents/${applicationId}`, token!),
    enabled: !!token && !!applicationId,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ category, file }: { category: string; file: File }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("category", category);

      const resp = await fetch(
        `${import.meta.env.VITE_STAFF_SERVER}/api/client-portal/upload/${applicationId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        },
      );

      if (!resp.ok) throw new Error("Upload failed");
      return resp.json();
    },
    onSuccess: () => qc.invalidateQueries(["portal-documents", applicationId]),
  });

  if (isLoading || !data) return <div>Loading…</div>;

  const handleUpload = (category: string) => {
    const input = fileInputRef.current;
    if (!input) return;

    input.value = "";
    input.onchange = () => {
      const files = input.files;
      if (files && files.length > 0) {
        uploadMutation.mutate({ category, file: files[0] });
      }
      input.value = "";
    };

    input.click();
  };

  const requiredDocs = data.required ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Required Documents</h1>

      {requiredDocs.length === 0 ? (
        <div>No documents required.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requiredDocs.map((doc: any) => (
            <div
              key={doc.category}
              className="p-4 rounded border bg-white shadow-sm"
            >
              <div className="font-medium text-gray-900">{doc.label}</div>

              <div className="mt-1 text-sm text-gray-600">
                Status:{" "}
                <span
                  className={
                    doc.status === "missing"
                      ? "text-red-600"
                      : doc.status === "uploaded"
                      ? "text-blue-600"
                      : doc.status === "rejected"
                      ? "text-red-600 font-semibold"
                      : "text-green-600"
                  }
                >
                  {doc.status}
                </span>
              </div>

              {doc.reason && (
                <div className="mt-1 text-xs text-red-600">Reason: {doc.reason}</div>
              )}

              <button
                className="mt-3 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                onClick={() => handleUpload(doc.category)}
              >
                {doc.status === "missing" ? "Upload" : "Replace"}
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden"
        ref={fileInputRef}
      />
    </div>
  );
}
