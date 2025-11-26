// Local-first product fetcher with fallbacks + cache (no engine).
// Prefers /api/v1/products; falls back to STAFF_API_URL/v1/products (Bearer token) then localStorage cache.

export type Product = {
  id?: string; _id?: string;
  name?: string; productName?: string;
  category?: string;
  minAmount?: number; maxAmount?: number;
  country?: string;
  lender_name?: string; lenderName?: string;
  [k: string]: any;
};

type Source = { name: 'local' | 'staff'; url: string; headers?: Record<string,string> };

const STAFF_BASE = (import.meta as any).env?.VITE_STAFF_API_BASE?.replace(/\/$/, '') || '';
const STAFF_TOKEN = (import.meta as any).env?.VITE_CLIENT_APP_SHARED_TOKEN || '';

const SOURCES: Source[] = [
  { name: 'local', url: '/api/v1/products' },
  ...(STAFF_BASE
    ? [{
        name: 'staff' as const,
        url: `${STAFF_BASE}/v1/products`,
        headers: STAFF_TOKEN ? { Authorization: `Bearer ${STAFF_TOKEN}` } : {},
      }]
    : []),
];

const CACHE_KEY = 'bf:products:v1';
const CATEGORIES_KEY = 'bf:step2:categories';

const isBrowser = typeof window !== 'undefined';

const safeStorage = {
  get(key: string) {
    if (!isBrowser) return null;
    try {
      return window.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    if (!isBrowser) return;
    try {
      window.localStorage?.setItem(key, value);
    } catch {
      // no-op in read-only or SSR environments
    }
  },
};

function toArray(x: any): Product[] {
  if (Array.isArray(x)) return x as Product[];
  if (x && Array.isArray(x.items)) return x.items as Product[];
  return [];
}

function normalizeProducts(products: Product[]): Product[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    const key = `${product.id || product._id || product.productName || product.name || "unknown"}|${(product.category || "").toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  }).map((product) => ({
    ...product,
    category: (product.category || product.productCategory || "").trim(),
  }));
}

async function tryFetch(src: Source): Promise<Product[] | null> {
  try {
    const res = await fetch(src.url, { headers: { ...(src.headers||{}), 'Accept': 'application/json' }, credentials: 'same-origin' });
    if (!res.ok) return null;
    const json = await res.json();
    const arr = toArray(json);
    return arr.length ? arr : null;
  } catch { return null; }
}

export async function getProducts(opts: { useCacheFirst?: boolean } = {}): Promise<Product[]> {
  // try cache first (for refreshes)
  if (opts.useCacheFirst) {
    const raw = safeStorage.get(CACHE_KEY);
    if (raw) {
      try { const j = JSON.parse(raw); if (Array.isArray(j?.data) && j.data.length) return j.data; } catch {}
    }
  }

  // iterate sources until one returns non-empty
  for (const src of SOURCES) {
    const res = await tryFetch(src);
    if (res && res.length) {
      const cleaned = normalizeProducts(res);
      safeStorage.set(CACHE_KEY, JSON.stringify({ at: Date.now(), source: src.name, data: cleaned }));
      if (isBrowser) {
        (window as any).__step2 = { source: src.name, count: cleaned.length, sample: cleaned.slice(0, 2) };
      }
      return cleaned;
    }
  }

  // last resort: return cached even if empty attempt failed
  const raw = safeStorage.get(CACHE_KEY);
  if (raw) { try { const j = JSON.parse(raw); if (Array.isArray(j?.data)) return j.data; } catch {} }
  return [];
}

// tiny helper for category storage
export function saveSelectedCategories(cats: string[]) {
  safeStorage.set(CATEGORIES_KEY, JSON.stringify(cats || []));
}

export function loadSelectedCategories(): string[] {
  try {
    const stored = safeStorage.get(CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
