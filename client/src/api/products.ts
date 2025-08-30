import { API_BASE, SHARED_TOKEN, USE_API_FIRST, MAY_FALLBACK } from "@/lib/env";

export async function fetchProducts() {
  if (USE_API_FIRST) {
    try {
      const res = await fetch(`${API_BASE}/v1/products`, {
        headers: { Authorization: `Bearer ${SHARED_TOKEN}` },
      });
      if (res.ok) return await res.json();
      console.warn("API /v1/products failed", res.status);
    } catch (e) {
      console.warn("API /v1/products error", e);
    }
  }
  if (MAY_FALLBACK) {
    // Use working local API with 42 products until Staff API is complete
    try {
      const res = await fetch('/api/lender-products');
      if (res.ok) {
        const data = await res.json();
        return data.products || data;
      }
      console.warn("Local API /api/lender-products failed", res.status);
    } catch (e) {
      console.warn("Local API error", e);
    }
  }
  throw new Error("Products unavailable (both APIs failed).");
}