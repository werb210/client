export type CanonicalProduct = {
  id?: string|number;
  name: string;
  category: string;
  lenderName: string;
  country: string;     // "CA" | "US" | ...
  minAmount: number;   // inclusive
  maxAmount: number;   // inclusive or Infinity
  raw: any;
};
const num = (v:any, d=0)=>{ const n=Number((v??'').toString().replace(/[$,_\s]/g,'')); return Number.isFinite(n)? n : d; };
const up  = (s:any)=> (s??"").toString().trim().toUpperCase();
export const toCanonical = (p:any): CanonicalProduct => {
  const name = p.name ?? p.productName ?? p.title ?? "";
  const lenderName = p.lenderName ?? p.lender_name ?? p.lender ?? "";
  const cc = up(p.country ?? p.countryCode ?? p.region ?? "");
  const country = cc==="CANADA" ? "CA" : cc==="USA" ? "US" : (cc==="UNITED STATES"?"US": (cc==="US"||cc==="CA"?cc:"NA"));
  const min = num(p.minAmount ?? p.min_amount ?? p.min ?? 0, 0);
  const maxRaw = p.maxAmount ?? p.max_amount ?? p.max ?? null;
  const max = maxRaw==null ? Number.POSITIVE_INFINITY : num(maxRaw, Number.POSITIVE_INFINITY);
  const category = p.category ?? p.type ?? "Unknown";
  return { id:p.id, name, category, lenderName, country, minAmount:min, maxAmount:max, raw:p };
};
