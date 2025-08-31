import { fetchProductsStable } from "./products";
export type UILender = { id:string; name:string; product_count:number };

export async function fetchUILenders(): Promise<UILender[]> {
  const prods = await fetchProductsStable();
  const by = new Map<string,UILender>();
  for (const p of prods) {
    const id = p.lenderName || 'Unknown';
    const cur = by.get(id) ?? { id, name:id, product_count:0 };
    cur.product_count += 1;
    by.set(id, cur);
  }
  return Array.from(by.values()).sort((a,b)=>b.product_count-a.product_count);
}