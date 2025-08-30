import { BASE, TOKEN, USE_LOCAL_PRODUCTS } from '@/lib/env';

export type Product = {
  id: string;
  name: string;
  active?: boolean;
  countries?: string[];
  purposes?: string[];
  industries?: string[];
  minAmount?: number;
  maxAmount?: number;
  minYearsInBusiness?: number;
  minRevenue12m?: number;
  minAvgMonthlyRevenue?: number;
};

export async function fetchProducts(): Promise<Product[]> {
  if (!USE_LOCAL_PRODUCTS) {
    const res = await fetch(`${BASE}/v1/products`, {
      headers: { 
        Authorization: `Bearer ${TOKEN}`, 
        'Cache-Control': 'no-store' 
      },
      credentials: 'omit',
    });
    if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
    return res.json();
  }
  
  // Dev-only: local cache fallback
  console.warn('🔧 Using local product cache (dev mode only)');
  return [];
}