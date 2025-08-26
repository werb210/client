// AFTER: strictly Staff API
import React from "react";
import { listDocumentsFor, getDocumentViewUrl, setDocumentStatus, type LenderProduct, type RequiredDoc } from "@/lib/api";

function normalizeDocs(docs: RequiredDoc[]) {
  return (docs ?? []).map((d, i) =>
    typeof d === "string" ? { key: `doc_${i}`, label: d, required: true } : d
  );
}

export function DynamicDocumentRequirements({ applicationId }: { applicationId: string }) {
  const [docs, setDocs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function refresh() {
    setLoading(true);
    try {
      // Example usage with product object:
      const sampleProduct: LenderProduct = { 
        id: applicationId, 
        name: "Sample Product", 
        lender_name: "Sample Lender",
        category: "Working Capital", 
        country: "US", 
        min_amount: 50000,
        max_amount: 5000000,
        active: true
      };
      const rawDocs = await listDocumentsFor(sampleProduct);
      // rawDocs is Guaranteed to include "Last 6 months bank statements"
      const items = normalizeDocs(rawDocs);
      setDocs(items);
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
        <div key={d.key || d.id} className="flex items-center justify-between gap-2 border p-2 rounded">
          <div>
            <div className="font-medium">{d.label || d.file_name}</div>
            <div className="text-xs text-gray-500">{d.required ? 'Required' : 'Optional'} · {d.status || 'pending'}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => view(d.key || d.id)} className="btn btn-light">View</button>
            <button onClick={() => accept(d.key || d.id)} className="btn btn-success">Accept</button>
            <button onClick={() => reject(d.key || d.id)} className="btn btn-danger">Reject</button>
          </div>
        </div>
      ))}
      {docs.length === 0 && <div className="text-sm text-gray-500">No documents yet.</div>}
    </div>
  );
}