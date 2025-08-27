import type { CanonicalProduct } from "./products";

export type ApplicationPayload = {
  applicant: { name: string; email: string; phone?: string };
  business: { legalName: string; country: "CA"|"US"; monthlyRevenue?: number; timeInBusinessMonths?: number };
  request: { amount: number; category?: string|null };
  product: Pick<CanonicalProduct,"id"|"name"|"lender_name"|"country"|"category"|"min_amount"|"max_amount">;
  documents: Array<{ key:string; url?:string; filename?:string }>;
};

export async function submitApplication(apiBase:string, token:string|undefined, payload: ApplicationPayload) {
  const r = await fetch(`${apiBase}/api/applications`, {
    method: "POST",
    headers: { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
    body: JSON.stringify(payload),
    credentials: "include"
  });
  if (!r.ok) throw new Error(`Submission failed: ${r.status}`);
  return r.json();
}