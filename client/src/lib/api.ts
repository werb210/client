const BASE = ""; // same-origin
function assertSameOrigin(url: string) {
  if (/^https?:\/\//i.test(url)) {
    const u = new URL(url);
    const allowed = [location.origin];
    if (!allowed.includes(`${u.origin}`)) {
      throw new Error(`External fetch blocked in client: ${u.origin}`);
    }
  }
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const url = typeof input === "string" ? input : input.toString();
  assertSameOrigin(url);
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${body}`);
  }
  return res;
}

export async function uploadDocument(appId: string, file: File, documentType: string) {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("document_type", documentType);

  const res = await apiFetch(`/api/applications/${appId}/documents/upload`, {
    method: "POST",
    body: fd,
  });
  return res.json() as Promise<{ ok: boolean; id?: string; file_key?: string }>;
}

export async function listDocuments(appId: string) {
  const res = await apiFetch(`/api/applications/${appId}/documents`);
  return res.json() as Promise<{ ok: boolean; data: any[] }>;
}

export async function setDocumentStatus(docId: string, status: "accepted"|"rejected"|"pending") {
  const res = await apiFetch(`/api/documents/${docId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json() as Promise<{ ok: boolean }>;
}

export async function getDocumentViewUrl(docId: string) {
  const res = await apiFetch(`/api/documents/${docId}/view`);
  return res.json() as Promise<{ ok: boolean; url?: string }>;
}

// Legacy compatibility functions
export async function submitApplication(data: any) {
  const res = await apiFetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getLenderProducts() {
  const res = await apiFetch("/api/lender-products");
  return res.json();
}

export async function fetchLenderProducts() {
  return getLenderProducts();
}