export type Intake = {
  capitalUse?: string;                 // 'Capital', 'Equipment', etc.
  amountRequested?: number;
  country?: 'US' | 'Canada';
  industry?: string;
  yearsInBusiness?: number;
  revenue12m?: number;
  avgMonthlyRevenue?: number;
  arBalance?: number;
  fixedAssets?: number;
};

const toNum = (v: unknown) =>
  typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^\d.-]/g, '') || 0);

export function normalizeStep1(raw: Record<string, unknown>): Intake {
  const result = {
    capitalUse: String(raw.capitalUse ?? raw.purpose ?? raw.lookingFor ?? raw.fundsPurpose ?? '').trim(),
    amountRequested: toNum(raw.amountRequested ?? raw.fundingAmount ?? raw.amount ?? raw.requestedAmount),
    country: (String(raw.businessLocation ?? raw.country ?? raw.headquarters ?? '').includes('Canada') ? 'Canada' : 'US') as 'US'|'Canada',
    industry: String(raw.industry ?? '').trim(),
    yearsInBusiness: toNum(raw.yearsInBusiness ?? raw.yib ?? (
      raw.salesHistory === '<1yr' ? 0.5 : 
      raw.salesHistory === '1-3yr' ? 2 : 
      raw.salesHistory === '3+yr' ? 4 : 0
    )),
    revenue12m: toNum(raw.revenue12m ?? raw.revenue ?? raw.last12mRevenue ?? raw.revenueLastYear),
    avgMonthlyRevenue: toNum(raw.avgMonthlyRevenue ?? raw.amr ?? raw.averageMonthlyRevenue),
    arBalance: toNum(raw.currentAccountReceivableBalance ?? raw.arBalance ?? raw.accountsReceivableBalance),
    fixedAssets: toNum(raw.fixedAssetsValue ?? raw.fixedAssets),
  };
  
  return result;
}

const KEY = 'bf:intake';
export const saveIntake = (obj: unknown) => {
  // Normalize the data before saving
  const normalized = normalizeStep1(obj as Record<string, unknown>);
  const jsonStr = JSON.stringify(normalized);
  
  try { 
    sessionStorage.setItem(KEY, jsonStr); 
    localStorage.setItem(KEY, jsonStr); // Belt and suspenders
  } catch (e) {
    console.error('❌ [saveIntake] Failed to save:', e);
  }
};
export const loadIntake = () => {
  try { const s = sessionStorage.getItem(KEY); return s ? JSON.parse(s) : null; }
  catch { return null; }
};