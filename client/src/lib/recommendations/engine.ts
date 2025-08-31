import { getRecommendedProducts } from './engine';
/* canonical recommendation engine (no duplicates); exports named+default */
// Define CanonicalProduct type directly since types file doesn't exist
type CanonicalProduct = {
  id: string;
  name: string;
  lenderName?: string;
  minAmount?: number;
  maxAmount?: number;
  country?: string;
  countryCode?: string;
  industries?: string[];
  active?: boolean;
  isActive?: boolean;
};

type AnyForm = Record<string, any>;
type Rec = CanonicalProduct & { score?: number };

function normalizeForm(raw: AnyForm) {
  const f = raw || {};
  const amount = Number(
    f.amountRequested ?? f.loanAmount ?? f.requestedAmount ?? f.amount ?? 0
  ) || 0;
  const country = String(
    f.country ?? f.countryCode ?? f.location?.country ?? ''
  ).toUpperCase().slice(0,2) || 'CA';
  const province = f.province ?? f.state ?? f.region ?? null;
  const industry = f.industry ?? f.naics ?? f.naicsCode ?? null;
  return { amount, country, province, industry, raw: f };
}

function pickProducts(form: ReturnType<typeof normalizeForm>, products: CanonicalProduct[] = []): Rec[] {
  const list = Array.isArray(products) ? products : [];
  const withinAmount = (p:any)=> {
    const min = Number(p.minAmount ?? 0) || 0;
    const max = Number(p.maxAmount ?? 9e12) || 9e12;
    return form.amount >= min && form.amount <= max;
  };
  const matchesCountry = (p:any)=>{
    const pc = String(p.country ?? p.countryCode ?? '').toUpperCase().slice(0,2);
    return !pc || pc === form.country;
  };
  const score = (p:any)=>{
    let s = 0;
    if (withinAmount(p)) s+=2;
    if (matchesCountry(p)) s+=2;
    if (form.industry && (p.industries?.includes?.(form.industry))) s+=1;
    return s;
  };
  return list
    .filter(p => withinAmount(p) && matchesCountry(p))
    .map(p => ({...p, score: score(p)}))
    .sort((a,b)=>(b.score||0)-(a.score||0));
}

/** Accept (form, products) or (products, form) defensively */
export function getRecommendedProducts(a:any,b:any): Rec[] {
  let form: any, products: any;
  if (Array.isArray(a)) { products = a; form = b; } else { form = a; products = b; }
  const nf = normalizeForm(form);
  const out = pickProducts(nf, products);
  try {
    if (typeof window !== 'undefined' && (window as any)) {
      (window as any).__step2 = { form: nf, inCount: Array.isArray(products)?products.length:0, outCount: out.length, sample: out.slice(0,3) };
    }
  } catch {}
  return out;
}
export default getRecommendedProducts;
