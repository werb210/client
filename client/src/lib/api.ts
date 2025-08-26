const BASE = ""; // same-origin

const ALLOW_PUBLIC_DOCS_IN_DEV =
  import.meta.env.DEV && import.meta.env.VITE_ALLOW_PUBLIC_DOCS_DEV === "1";

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
    method: "POST", body: fd, credentials: "include"
  });
  if (!r.ok) throw new Error(`upload failed: ${r.status}`); return r.json();
}

export async function listDocuments(appId: string) {
  const path = ALLOW_PUBLIC_DOCS_IN_DEV
    ? `/api/public/applications/${appId}/documents` // **dev only**
    : `/api/applications/${appId}/documents`;        // **prod & default**
  const r = await fetch(path, { credentials: "include" });
  if (!r.ok) throw new Error(`list failed: ${r.status}`); return r.json();
}

export async function setDocumentStatus(docId: string, status: "accepted"|"rejected"|"pending") {
  const r = await fetch(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!r.ok) throw new Error(`patch failed: ${r.status}`); return r.json();
}

export async function getDocumentViewUrl(docId: string) {
  const r = await fetch(`/api/documents/${docId}/view`, { credentials: "include" });
  if (!r.ok) throw new Error(`view failed: ${r.status}`);
  return r.json();
}

export async function fetchLenderProducts() {
  const r = await fetch("/api/lender-products", { credentials: "include" });
  if (!r.ok) throw new Error(`lender products failed: ${r.status}`);
  const response = await r.json();
  console.log('[fetchLenderProducts] API response:', response);
  
  // Extract products array from response
  if (response.success && response.products) {
    console.log(`[fetchLenderProducts] Returning ${response.products.length} products`);
    return response.products;
  } else {
    console.error('[fetchLenderProducts] Invalid response structure:', response);
    return [];
  }
}