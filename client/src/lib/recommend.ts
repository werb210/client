import type { CanonicalProduct } from "./products";

export type Intake = { country: "CA"|"US"; amount: number; timeInBusinessMonths?: number; monthlyRevenue?: number; };

export function recommend(products: CanonicalProduct[], intake: Intake) {
  // Guard against undefined intake
  if (!intake || typeof intake.amount === 'undefined') {
    return [];
  }
  
  // Strict country match; products with null country are excluded.
  const eligible = products.filter(p =>
    p.active !== false &&
    p.country === intake.country &&
    (p.min_amount == null || p.min_amount <= intake.amount) &&
    (p.max_amount == null || p.max_amount >= intake.amount) &&
    (intake.timeInBusinessMonths == null || p.min_time_in_business == null || p.min_time_in_business <= intake.timeInBusinessMonths) &&
    (intake.monthlyRevenue == null || p.min_monthly_revenue == null || p.min_monthly_revenue <= intake.monthlyRevenue)
  );
  // Score by closeness to requested amount
  return eligible
    .map(p => ({ p, score: Math.abs((p.max_amount ?? intake.amount) - intake.amount) }))
    .sort((a,b)=> a.score - b.score)
    .map(x=>x.p);
}