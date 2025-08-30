// client/src/api/products.ts
const BASE = import.meta.env.VITE_STAFF_API_URL!;
const TOK  = import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN!;

export async function fetchProducts() {
  const res = await fetch(`${BASE}/v1/products`, {
    headers: { Authorization: `Bearer ${TOK}` },
  });
  (window as any).__step2 = { ...(window as any).__step2, lastFetch: { url: `${BASE}/v1/products`, authorized: !!TOK } };
  if (!res.ok) throw new Error(`products_fetch_failed_${res.status}`);
  const data = await res.json();
  (window as any).__step2 = { ...(window as any).__step2, source: 'staff', products: data, productsCount: data.length };
  return data;
}