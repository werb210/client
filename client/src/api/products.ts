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
export default { fetchProducts, fetchRequiredDocs };
