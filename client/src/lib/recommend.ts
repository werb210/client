import type { CanonicalProduct } from "./products";

export type Intake = {
  country: "CA"|"US";
  amount: number;
  timeInBusinessMonths?: number;
  monthlyRevenue?: number;
  categoryPreference?: string|null; // optional
};

export function recommend(intake: Intake, products: CanonicalProduct[]) {
  const eligible = products.filter(p => {
    if (!p.active) return false;
    if ((p.country ?? intake.country) !== intake.country) return false;
    if (p.min_amount != null && intake.amount < p.min_amount) return false;
    if (p.max_amount != null && intake.amount > p.max_amount) return false;
    if (p.min_time_in_business != null && (intake.timeInBusinessMonths ?? 0) < p.min_time_in_business) return false;
    if (p.min_monthly_revenue != null && (intake.monthlyRevenue ?? 0) < p.min_monthly_revenue) return false;
    return true;
  });

  const scored = eligible.map(p => {
    const dist =
      (p.min_amount!=null && intake.amount < p.min_amount) ? (p.min_amount - intake.amount) :
      (p.max_amount!=null && intake.amount > p.max_amount) ? (intake.amount - p.max_amount) : 0;
    const catBonus = (intake.categoryPreference && p.category === intake.categoryPreference) ? -1000 : 0;
    return { p, score: dist + catBonus };
  }).sort((a,b)=>a.score-b.score);

  // group by category for UI
  const byCat = new Map<string, CanonicalProduct[]>();
  for (const {p} of scored) {
    const k = p.category ?? "Uncategorized";
    if (!byCat.has(k)) byCat.set(k, []);
    byCat.get(k)!.push(p);
  }
  return { eligible: scored.map(x=>x.p), byCategory: byCat };
}

// Legacy export for backward compatibility
export type CanonicalProduct = {
  id:string; name:string; country:string|null; category:string;
  min_amount:number; max_amount:number; active:boolean;
};

export function filterByIntake(products:CanonicalProduct[], intake:{country:'CA'|'US', amount:number}) {
  const cc = intake.country.toUpperCase();
  return products.filter(p => {
    const pc = (p.country || '').toUpperCase();
    if (!pc || pc !== cc) return false;                         // strict match
    if (p.active === false) return false;
    if (Number.isFinite(p.min_amount) && p.min_amount > intake.amount) return false;
    if (Number.isFinite(p.max_amount) && p.max_amount < intake.amount) return false;
    return true;
  });
}