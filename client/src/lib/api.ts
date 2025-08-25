const BASE = ""; // same-origin

export async function apiFetch(path: string, init: RequestInit = {}) {
  const r = await fetch(`${BASE}${path}`, { credentials: "include", ...init });
  if (!r.ok) throw new Error(`fetch failed: ${r.status}`);
  return r;
}

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
  const path = import.meta.env.PROD
    ? `/api/applications/${appId}/documents`          // auth-protected in PROD
    : `/api/public/applications/${appId}/documents`;  // dev helper only
  const r = await fetch(path, { credentials: "include" });
  if (!r.ok) throw new Error(`list failed: ${r.status}`);
  return r.json();
}

export async function setDocumentStatus(docId: string, status: "accepted"|"rejected"|"pending") {
  const r = await fetch(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  if (!r.ok) throw new Error(`status failed: ${r.status}`);
  return r.json();
}

export async function getDocumentViewUrl(docId: string) {
  const r = await fetch(`/api/documents/${docId}/view`, { credentials: "include" });
  if (!r.ok) throw new Error(`view failed: ${r.status}`);
  return r.json();
}

export async function fetchLenderProducts() {
  const r = await fetch("/api/lender-products", { credentials: "include" });
  if (!r.ok) throw new Error(`lender products failed: ${r.status}`);
  return r.json();
}