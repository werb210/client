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
    const data: any[] = []; // Fallback data if needed
    return data;
  }
  throw new Error("Products unavailable (API failed and fallback disabled).");
}