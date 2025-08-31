import { getProducts } from "../../api/products";

export type Lender = {
  id: string; name: string; legal_name?: string|null; slug?: string|null;
  website?: string|null; contact_email?: string|null; contact_phone?: string|null;
  country?: string|null; is_active: boolean;
};

// All lender operations now route through the unified products fetcher
export async function listLenders(params?: { q?: string; country?: string; active?: boolean; limit?: number; offset?: number }): Promise<Lender[]> {
  const products = await getProducts();
  // Convert products to lender format
  let lenders = products.map(p => ({
    id: p.id || p.name || 'unknown',
    name: p.lenderName || p.lender_name || p.name || 'Unknown Lender',
    legal_name: p.lenderName || p.lender_name,
    slug: null,
    website: null,
    contact_email: null,
    contact_phone: null,
    country: p.country,
    is_active: true
  })) as Lender[];
  
  // Apply filters
  if(params?.country) lenders = lenders.filter(l => l.country === params.country);
  if(params?.active !== undefined) lenders = lenders.filter(l => l.is_active === params.active);
  if(params?.q) lenders = lenders.filter(l => l.name.toLowerCase().includes(params.q.toLowerCase()));
  if(params?.limit) lenders = lenders.slice(0, params.limit);
  if(params?.offset) lenders = lenders.slice(params.offset);
  
  return lenders;
}

export async function getLender(id: string): Promise<Lender> {
  const lenders = await listLenders();
  const lender = lenders.find(l => l.id === id);
  if (!lender) throw new Error(`Lender ${id} not found`);
  return lender;
}

export async function createLender(data: Partial<Lender> & { id: string; name: string }): Promise<{ ok: true; id: string }> {
  throw new Error("Lender mutations not supported - use unified products system");
}

export async function updateLender(id: string, data: Partial<Lender>): Promise<{ ok: true }> {
  throw new Error("Lender mutations not supported - use unified products system");
}

export async function deleteLender(id: string): Promise<{ ok: true }> {
  throw new Error("Lender mutations not supported - use unified products system");
}