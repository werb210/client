import { getFormSnapshot } from "./getFormSnapshot";
/**
 * Application submission logic with business criteria and CSRF handling
 */
import { ensureCsrf } from './csrf';

export async function submitApplication(payload: {
  product_id: string;
  country: "CA"|"US";
  amount: number;
  years_in_business: number;
  monthly_revenue: number;
  business_legal_name: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  documents: { type: string; url?: string }[];
}) {
  await ensureCsrf();

  const r = await fetch(`${import.meta.env.VITE_STAFF_API_BASE}/v1/applications`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify((()=>{ /*LOSSLESS_PAYLOAD*/ try{ const snap=(typeof window!=="undefined" && (window as any).__APP_STATE__)||{}; const payloadExt:any={...payload}; payloadExt.payload = getFormSnapshot(snap); payloadExt.formFields = payloadExt.payload; return payloadExt; }catch(_){ return payload; }})()),
  });

  if (r.status === 400) {
    const j = await r.json();
    throw new Error((j.errors || []).join(" "));
  }
  if (!r.ok) throw new Error(`Submission failed (HTTP ${r.status})`);

  return r.json(); // { ok, submission_id, status:"QUEUED" }
}