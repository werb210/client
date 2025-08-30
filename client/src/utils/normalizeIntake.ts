export type Intake = {
  amount: number;
  country: 'CA' | 'US';
  monthlyRevenue: number;
  timeInBusinessMonths: number;
  industry: string;
};

const toNum = (v: unknown) => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
};
const toCountry = (v: unknown): Intake['country'] | null => {
  const s = String(v ?? '').trim().toUpperCase();
  if (['CA', 'CANADA'].includes(s)) return 'CA';
  if (['US', 'USA', 'UNITED STATES'].includes(s)) return 'US';
  return null;
};

/** Accepts {intake}, {formData}, or a raw object; returns a safe Intake or null. */
export function normalizeIntake(raw: any): Intake | null {
  const src = raw?.intake ?? raw?.formData ?? raw ?? {};
  
  // Support multiple country field names including ApplicationForm
  const country = toCountry(src.country ?? src.headquarters);
  if (!country) return null;

  // Support multiple amount field names including ApplicationForm
  const amount = toNum(src.amount ?? src.fundingAmount ?? src.loanAmount ?? src.requestedAmount);
  const monthlyRevenue = toNum(src.monthlyRevenue ?? src.monthly_revenue ?? src.averageMonthlyRevenue);
  
  // Convert salesHistory to approximate months in business
  const timeInBusinessMonths = toNum(
    src.timeInBusinessMonths ?? src.time_in_business_months ??
    (src.salesHistory === '<1yr' ? 6 : 
     src.salesHistory === '1-3yr' ? 24 : 
     src.salesHistory === '3+yr' ? 48 : 0)
  );
  
  // Support multiple industry field names
  const industry = String(src.industry ?? src.fundsPurpose ?? src.use_of_funds ?? '').trim();

  return {
    country,
    amount: Number.isFinite(amount) ? amount : 0,
    monthlyRevenue: Number.isFinite(monthlyRevenue) ? monthlyRevenue : 0,
    timeInBusinessMonths: Number.isFinite(timeInBusinessMonths)
      ? timeInBusinessMonths
      : 0,
    industry,
  };
}

const KEY = 'bf:intake';
export const saveIntake = (obj: unknown) => {
  try { sessionStorage.setItem(KEY, JSON.stringify(obj)); } catch {}
};
export const loadIntake = () => {
  try { const s = sessionStorage.getItem(KEY); return s ? JSON.parse(s) : null; }
  catch { return null; }
};