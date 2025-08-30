import type { Intake } from '@/utils/normalizeIntake';

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

export function eligible(p: Product, i: Intake): boolean {
  if (p.active === false) return false;

  if (p.countries?.length && i.country && !p.countries.includes(i.country)) return false;

  if (p.purposes?.length && i.capitalUse) {
    const needle = i.capitalUse.toLowerCase();
    if (!p.purposes.some(x => String(x).toLowerCase() === needle)) return false;
  }

  if (p.industries?.length && i.industry) {
    const low = i.industry.toLowerCase();
    if (!p.industries.some(x => String(x).toLowerCase() === low)) return false;
  }

  if (p.minAmount && (i.amountRequested ?? 0) < p.minAmount) return false;
  if (p.maxAmount && (i.amountRequested ?? 0) > p.maxAmount) return false;

  if (p.minYearsInBusiness && (i.yearsInBusiness ?? 0) < p.minYearsInBusiness) return false;
  if (p.minRevenue12m && (i.revenue12m ?? 0) < p.minRevenue12m) return false;
  if (p.minAvgMonthlyRevenue && (i.avgMonthlyRevenue ?? 0) < p.minAvgMonthlyRevenue) return false;

  return true;
}

export function score(p: Product, i: Intake): number {
  // Simple heuristic; adjust as needed
  let s = 0;
  if (p.purposes?.length && i.capitalUse) s += 10;
  if (p.industries?.length && i.industry) s += 8;
  if (i.amountRequested && p.minAmount) s += 6;
  if (i.yearsInBusiness && p.minYearsInBusiness) s += 4;
  if (i.revenue12m && p.minRevenue12m) s += 4;
  return s;
}