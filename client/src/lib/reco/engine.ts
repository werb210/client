import { Product, Category } from '../products/normalize';

export type UserFilters = {
  country: 'US'|'CA'|string;
  fundingAmount: number;
  productPreference: 'capital'|'equipment'|'both';
  categoryEnum?: Category;            // optional strict enum when known
  estRevenue?: number;                // annual revenue if applicable
  hasAR?: boolean;                    // accounts receivable present
  purpose?: 'inventory'|'equipment'|'general'|string;
};

const PRODUCT_CATEGORY_MAP: Record<'capital'|'equipment'|'both', Category[]> = {
  capital: ['term_loan','working_capital','line_of_credit'],
  equipment: ['equipment_financing'],
  both: ['term_loan','working_capital','line_of_credit','equipment_financing'],
};

function hardEligible(p: Product, f: UserFilters): boolean {
  // Geography
  if (p.country !== f.country) return false;

  // Amount range
  if (!(f.fundingAmount >= p.minAmount && f.fundingAmount <= p.maxAmount)) return false;

  // Product type / category mapping
  const allowed = PRODUCT_CATEGORY_MAP[f.productPreference] ?? [];
  if (f.categoryEnum) {
    if (p.category !== f.categoryEnum) return false;           // strict category enum when provided
  } else {
    if (!allowed.includes(p.category)) return false;
  }

  return true;
}

function categoryScore(p: Product, f: UserFilters): number {
  // 0–30 based on relevance inside the allowed set
  const pref = PRODUCT_CATEGORY_MAP[f.productPreference] ?? [];
  if (f.categoryEnum) return p.category === f.categoryEnum ? 30 : 0;
  if (!pref.includes(p.category)) return 0;
  if (p.category === 'term_loan' || p.category === 'working_capital') return 28;
  if (p.category === 'line_of_credit') return 26;
  if (p.category === 'equipment_financing') return 24;
  return 20;
}

function amountOptimizationScore(p: Product, f: UserFilters): number {
  // 5–20 based on multiples of minAmount
  const ratio = f.fundingAmount / Math.max(1, p.minAmount);
  if (ratio >= 1 && ratio <= 2) return 20;       // optimal
  if (ratio > 2 && ratio <= 5) return 15;        // good
  return 10;                                     // acceptable (>5x)
}

function revenueScore(_p: Product, f: UserFilters): number {
  // 0–10: +10 if no revenue requirement (we don't model it) or estRevenue meets requirement
  // Since product revenue requirement is not modeled, grant +10 when estRevenue provided or unknown requirement.
  return (typeof f.estRevenue === 'number' ? 10 : 10);
}

function specialInclusionScore(p: Product, f: UserFilters): number {
  // 0–15: special combos
  if (p.category === 'invoice_factoring' && f.hasAR) return 15;
  if (p.category === 'purchase_order_financing' && f.purpose === 'inventory') return 15;
  return 0;
}

export type ScoredProduct = Product & { score: number; level: 'Excellent'|'Good'|'Fair' };

function toLevel(score: number): 'Excellent'|'Good'|'Fair' {
  if (score >= 70) return 'Excellent';
  if (score >= 50) return 'Good';
  return 'Fair';
}

export function recommend(products: Product[], filters: UserFilters, topK = 5): ScoredProduct[] {
  const eligible = products.filter(p => hardEligible(p, filters));
  const scored = eligible.map(p => {
    const score =
      categoryScore(p, filters) +
      amountOptimizationScore(p, filters) +
      revenueScore(p, filters) +
      specialInclusionScore(p, filters);
    return { ...p, score, level: toLevel(score) };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}