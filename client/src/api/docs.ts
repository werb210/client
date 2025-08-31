/**
 * Step 5 API (local-first) — required docs + (optional) uploads.
 * Order: local /api/required-docs -> staff /required-docs -> static fallback.
 * Uploads are disabled by default; enable via VITE_DOC_UPLOAD_ENABLED=true.
 */
export type RequiredDocsResponse = { required_documents?: string[] } | string[];

// env
const STAFF_BASE = (import.meta as any).env?.VITE_STAFF_API_URL?.replace(/\/$/, '') || '';
const STAFF_TOKEN = (import.meta as any).env?.VITE_CLIENT_APP_SHARED_TOKEN || '';
const DOC_UPLOAD_ENABLED = ((import.meta as any).env?.VITE_DOC_UPLOAD_ENABLED || 'false') === 'true';

function toList(x:any): string[] {
  if (!x) return [];
  if (Array.isArray(x)) return x as string[];
  if (Array.isArray(x.required_documents)) return x.required_documents as string[];
  return [];
}

const STATIC_FALLBACK: Record<string,string[]> = {
  // minimal safe baseline aligned to current rules
  base: ["Bank Statements (6m)", "Business Tax Returns (3y)", "Financial Statements (P&L, BS)"],
  term_loan: ["Cash Flow Statement"],
  equipment_financing: ["Equipment Quote"],
  line_of_credit: [],
  working_capital: [],
  invoice_factoring: ["A/R Aging Report", "Invoice Samples"],
};

export async function getRequiredDocs(input?: { country?: string; amount?: number; category?: string }): Promise<string[]> {
  // 1) local first
  try {
    const res = await fetch(`/api/required-docs`, { credentials: 'same-origin' });
    if (res.ok) {
      const json = await res.json();
      const list = toList(json);
      if (list.length) {
        (window as any).__step5 = { source:"local", count:list.length, sample:list.slice(0,3) };
        return list;
      }
    }
  } catch {}

  // 2) staff fallback
  if (STAFF_BASE) {
    try {
      const res = await fetch(`${STAFF_BASE}/required-docs`, {
        headers: { ...(STAFF_TOKEN ? { Authorization: `Bearer ${STAFF_TOKEN}` } : {}), 'Accept':'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        const list = toList(json);
        if (list.length) {
          (window as any).__step5 = { source:"staff", count:list.length, sample:list.slice(0,3) };
          return list;
        }
      }
    } catch {}
  }

  // 3) static fallback (never empty)
  const base = STATIC_FALLBACK.base;
  const extra = input?.category ? (STATIC_FALLBACK[input.category] || []) : [];
  const list = Array.from(new Set([...base, ...extra]));
  (window as any).__step5 = { source:"static", count:list.length, sample:list.slice(0,3) };
  return list;
}

// Optional upload — remains disabled unless env flag is true.
export async function uploadDocument(file: File): Promise<{ id?: string; url?: string }> {
  if (!DOC_UPLOAD_ENABLED) throw new Error("Document upload disabled (VITE_DOC_UPLOAD_ENABLED=false)");
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`/api/uploads`, { method:'POST', body: fd, credentials: 'same-origin' });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}
