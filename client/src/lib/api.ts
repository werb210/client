// client/src/lib/api.ts
const SAME_ORIGIN_BASE = ""; // always same-origin

function toPath(path: string) {
  // ensure leading slash, no full externals
  if (/^https?:\/\//i.test(path)) throw new Error(`external URL not allowed: ${path}`);
  return path.startsWith("/") ? path : `/${path}`;
}

/** Minimal fetch wrapper used across the app */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = `${SAME_ORIGIN_BASE}${toPath(path)}`;
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`apiFetch ${res.status} ${url} :: ${txt.slice(0, 200)}`);
  }
  return res;
}

/** Upload a document to Staff API (multipart) */
export async function uploadDocument(appId: string, file: File, documentType: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("document_type", documentType);
  const r = await apiFetch(`/api/applications/${appId}/documents/upload`, { method: "POST", body: fd });
  return r.json();
}

/** List documents (prod uses protected route; dev may use /api/public) */
export async function listDocuments(appId: string) {
  const path = import.meta.env.PROD
    ? `/api/applications/${appId}/documents`
    : `/api/public/applications/${appId}/documents`;
  const r = await apiFetch(path);
  return r.json();
}

/** Update document status */
export async function setDocumentStatus(docId: string, status: "accepted" | "rejected" | "pending") {
  const r = await apiFetch(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return r.json();
}

/** Get document view URL */
export async function getDocumentViewUrl(docId: string) {
  const r = await apiFetch(`/api/documents/${docId}/view`);
  return r.json();
}

/** Get lender products */
export async function getLenderProducts() {
  const r = await apiFetch("/api/lender-products");
  return r.json();
}

/** Fetch lender products (alias) */
export async function fetchLenderProducts() {
  return getLenderProducts();
}

/** Submit application */
export async function submitApplication(data: any) {
  const r = await apiFetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}