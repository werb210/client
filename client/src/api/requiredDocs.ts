import { API_BASE, SHARED_TOKEN, USE_API_FIRST, MAY_FALLBACK } from "@/lib/env";

export async function fetchRequiredDocs(productId: string) {
  if (USE_API_FIRST) {
    try {
      const res = await fetch(`${API_BASE}/required-docs?productId=${encodeURIComponent(productId)}`, {
        headers: { Authorization: `Bearer ${SHARED_TOKEN}` },
      });
      if (res.ok) return await res.json();
      console.warn("API /required-docs failed", res.status);
    } catch (e) {
      console.warn("API /required-docs error", e);
    }
  }
  if (MAY_FALLBACK) {
    return []; // Fallback data if needed
  }
  throw new Error("Required docs unavailable.");
}