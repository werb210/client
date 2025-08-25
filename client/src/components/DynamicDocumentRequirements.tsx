// AFTER: strictly Staff API
import React from "react";
import { listDocuments, getDocumentViewUrl, setDocumentStatus } from "@/lib/api";

export function DynamicDocumentRequirements({ applicationId }: { applicationId: string }) {
  const [docs, setDocs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await listDocuments(applicationId);
      setDocs(res.data || []);
    } finally {
      setLoading(false);
    }
  }
  React.useEffect(() => { refresh(); }, [applicationId]);

  async function view(docId: string) {
    const { url } = await getDocumentViewUrl(docId);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }
  async function accept(docId: string) {
    await setDocumentStatus(docId, "accepted");
    refresh();
  }
  async function reject(docId: string) {
    await setDocumentStatus(docId, "rejected");
    refresh();
  }

  if (loading) return <div>Loading documents…</div>;
  return (
    <div className="space-y-2">
      {docs.map(d => (
        <div key={d.id} className="flex items-center justify-between gap-2 border p-2 rounded">
          <div>
            <div className="font-medium">{d.file_name}</div>
            <div className="text-xs text-gray-500">{d.document_type} · {d.status}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => view(d.id)} className="btn btn-light">View</button>
            <button onClick={() => accept(d.id)} className="btn btn-success">Accept</button>
            <button onClick={() => reject(d.id)} className="btn btn-danger">Reject</button>
          </div>
        </div>
      ))}
      {docs.length === 0 && <div className="text-sm text-gray-500">No documents yet.</div>}
    </div>
  );
}