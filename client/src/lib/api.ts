const BASE = "";

export async function uploadDocument(appId: string, file: File, documentType: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("document_type", documentType);
  const r = await fetch(`${BASE}/api/applications/${appId}/documents/upload`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!r.ok) throw new Error(`upload failed: ${r.status}`);
  return r.json();
}

export async function listDocuments(appId: string) {
  // In production use the staff-protected route:
  const path = import.meta.env.PROD ? `/api/applications/${appId}/documents`
                                    : `/api/public/applications/${appId}/documents`; // dev-only helper
  const r = await fetch(path, { credentials: "include" });
  if (!r.ok) throw new Error(`list failed: ${r.status}`);
  return r.json();
}

export async function setDocumentStatus(docId: string, status: "accepted"|"rejected"|"pending") {
  const r = await fetch(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!r.ok) throw new Error(`status failed: ${r.status}`);
  return r.json();
}

export async function getDocumentViewUrl(docId: string) {
  const r = await fetch(`/api/documents/${docId}/view`, { credentials: "include" });
  if (!r.ok) throw new Error(`view failed: ${r.status}`);
  return r.json();
}

// Legacy compatibility functions
export async function submitApplication(data: any) {
  const r = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`submit failed: ${r.status}`);
  return r.json();
}

export async function getLenderProducts() {
  const r = await fetch("/api/lender-products", { credentials: "include" });
  if (!r.ok) throw new Error(`lender products failed: ${r.status}`);
  return r.json();
}

export async function fetchLenderProducts() {
  return getLenderProducts();
}