import { BASE, TOKEN } from '@/lib/env';

export async function fetchRequiredDocs(productId: string) {
  const url = `${BASE}/required-docs?productId=${encodeURIComponent(productId)}`;
  const res = await fetch(url, {
    headers: { 
      Authorization: `Bearer ${TOKEN}`, 
      'Cache-Control': 'no-store' 
    },
    credentials: 'omit',
  });
  if (!res.ok) throw new Error(`required-docs ${res.status}`);
  return res.json() as Promise<Array<{code:string; title:string; optional?:boolean}>>;
}