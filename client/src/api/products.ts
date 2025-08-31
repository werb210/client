// Removed circular import
export type Product = {
  id?: string|number;
  productName?: string;
  category?: string;
  country?: string;
  minAmount?: number;
  maxAmount?: number;
  [k:string]: any;
};
const BASE = (import.meta.env.VITE_STAFF_API_URL || "https://staff.boreal.financial/api").replace(/\/+$/,'');
const TOKEN = (import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || "");

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/v1/products`, { headers: TOKEN? {Authorization:`Bearer ${TOKEN}`} : {}, credentials: "include" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.items || []);
}
export async function fetchRequiredDocs(): Promise<any[]> {
  const res = await fetch(`${BASE}/required-docs`, { credentials: "include" });
  if (!res.ok) return [];
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).required_documents)) return (data as any).required_documents;
  return (data as any).items || [];
}
// Aliases for compatibility with existing code
export const fetchLenderProducts = fetchProducts;
export const fetchDocumentRequirements = fetchRequiredDocs;

// Additional API functions for complete app coverage
export async function fetchApplications(): Promise<any[]> {
  const res = await fetch(`${BASE}/applications`, { headers: TOKEN? {Authorization:`Bearer ${TOKEN}`} : {}, credentials: "include" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.items || []);
}

export async function submitApplication(applicationData: any): Promise<any> {
  const res = await fetch(`${BASE}/applications`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(TOKEN? {Authorization:`Bearer ${TOKEN}`} : {}) },
    credentials: "include",
    body: JSON.stringify(applicationData)
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
  return await res.json();
}

export async function fetchApplicationStatus(id: string): Promise<any> {
  const res = await fetch(`${BASE}/applications/${id}/status`, { headers: TOKEN? {Authorization:`Bearer ${TOKEN}`} : {}, credentials: "include" });
  if (!res.ok) return null;
  return await res.json();
}

function getStep1(){ try { return JSON.parse(localStorage.getItem("formData")||"null")||{}; } catch { return {}; } }
export async function getRecommendedProducts(){
  const raw = await fetchProducts();
  const { toCanonical } = await import("./normalize");
  const list = raw.map(toCanonical);
  const s1:any = getStep1();
  const amount = Number(s1.amountRequested ?? s1.loanAmount ?? s1.requestedAmount ?? s1.requested_amount ?? s1.amount ?? s1.fundsNeeded ?? s1.fundingAmount ?? s1.loan_size ?? 0) || 0;
  const cc = (s1.country ?? s1.countryCode ?? s1.applicantCountry ?? s1.region ?? "").toString().toUpperCase();
  const country = cc==="CANADA"?"CA":(cc==="USA"||cc==="UNITED STATES"?"US":cc);
  const matches = list.filter(p => (!country || p.country===country) && (!amount || (p.minAmount<=amount && amount<=p.maxAmount)));
  return { all:list, matches };
}

export default { fetchProducts, fetchRequiredDocs, fetchApplications, submitApplication, fetchApplicationStatus, fetchLenderProducts, fetchDocumentRequirements, getRecommendedProducts };
