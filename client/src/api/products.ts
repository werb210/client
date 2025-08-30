// client/src/api/products.ts
const BASE = import.meta.env.VITE_STAFF_API_URL!;
const TOK  = import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN!;

export async function fetchProducts() {
  // Try Staff API /lenders endpoint first (confirmed working)
  try {
    const res = await fetch(`${BASE}/lenders`, {
      headers: { Authorization: `Bearer ${TOK}` },
    });
    (window as any).__step2 = { ...(window as any).__step2, lastFetch: { url: `${BASE}/lenders`, authorized: !!TOK, status: res.status } };
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ [fetchProducts] Staff API /lenders success:', data?.length || 0, 'items');
      (window as any).__step2 = { ...(window as any).__step2, source: 'staff_lenders', products: data, productsCount: data?.length || 0 };
      return Array.isArray(data) ? data : [];
    } else {
      console.warn('⚠️ [fetchProducts] Staff API /lenders failed:', res.status);
    }
  } catch (e) {
    console.warn('⚠️ [fetchProducts] Staff API error:', e);
  }
  
  // Fallback to local products if Staff API fails
  console.log('🔄 [fetchProducts] Falling back to local products...');
  const localProducts = await import('../../data/lenderProducts.json');
  const products = localProducts.default || localProducts;
  console.log('✅ [fetchProducts] Local fallback loaded:', products.length, 'products');
  (window as any).__step2 = { ...(window as any).__step2, source: 'local_fallback', products, productsCount: products.length };
  return products;
}