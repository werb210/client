import type { V1Product } from "./products";
export type Intake = { country:'US'|'CA'; amount:number; category?:string };
export type RequiredDoc = { key:string; label:string; required:boolean; months?:number };

export function filterProducts(intake: Intake, prods: V1Product[]) {
  const cc = intake.country.toUpperCase();
  return prods.filter(p => {
    const country = String(p.countryOffered||'').toUpperCase();
    const min = Number(p.minimumLendingAmount ?? 0);
    const max = Number(p.maximumLendingAmount ?? Number.MAX_SAFE_INTEGER);
    const inCountry = country === cc;
    const inAmount = min <= intake.amount && intake.amount <= max;
    const active = (p.isActive ?? true) !== false;
    const inCat = intake.category ? (p.productCategory === intake.category) : true;
    return inCountry && inAmount && active && inCat;
  });
}

export async function listDocs(intake: Intake): Promise<RequiredDoc[]> {
  // Staff docs endpoint may not exist; fallback to 6-month bank statements.
  try {
    const r = await fetch('/api/required-docs', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ category: intake.category, country: intake.country, amount: intake.amount })
    });
    if (r.ok) {
      const j = await r.json();
      if (Array.isArray(j?.documents) && j.documents.length) return j.documents;
    }
  } catch {}
  return [{ key:'bank_6m', label:'Last 6 months bank statements', required:true, months:6 }];
}