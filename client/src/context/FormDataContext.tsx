import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ApplicationForm = {
  // keep both names to survive older forms/agents
  requestedAmount?: number;      // preferred
  fundingAmount?: number;        // legacy
  businessLocation?: string;
  industry?: string;
  purpose?: string;
  yearsInBusiness?: string | number;
  last12moRevenue?: number | string;
  avgMonthlyRevenue?: number | string;
  arBalance?: number | string;
  fixedAssets?: number | string;
  // ...any other fields you actually use in the matcher
};

export type Intake = {
  country: 'US' | 'CA';
  amountRequested: number;     // normalized number
  industry?: string;
  yearsInBusiness?: number;
  revenue12m?: number;
  avgMonthlyRevenue?: number;
  purpose?: string;
  arBalance?: number;
  collateralValue?: number;
  // ...other fields your matcher expects
};

const KEY = "bf:intake:v2";

function toNum(x: any) {
  if (x == null || x === undefined) return undefined;
  if (typeof x === "number") return x;
  // strip $, commas, spaces
  const n = Number(String(x).replace(/[$, ]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

const toNumber = (v:any) => typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^0-9.]/g,''));

export function normalizeIntake(raw:any): Intake {
  // Defensive coding - ensure raw is an object
  const safeRaw = raw && typeof raw === 'object' ? raw : {};
  
  return {
    country: safeRaw.country ?? safeRaw.headquarters ?? safeRaw.businessLocation ?? 'US',
    amountRequested: toNumber(safeRaw.fundingAmount ?? safeRaw.requestedAmount ?? safeRaw.amountRequested),
    industry: safeRaw.industry ?? safeRaw.naics,
    yearsInBusiness: toNumber(safeRaw.yearsInBusiness ?? safeRaw.businessAgeYears),
    revenue12m: toNumber(safeRaw.revenueLast12Months ?? safeRaw.annualRevenue ?? safeRaw.revenueLastYear),
    avgMonthlyRevenue: toNumber(safeRaw.avgMonthlyRevenue ?? safeRaw.monthlyRevenue ?? safeRaw.averageMonthlyRevenue),
    purpose: safeRaw.purposeOfFunds ?? safeRaw.purpose ?? safeRaw.fundsPurpose,
    arBalance: toNumber(safeRaw.currentARBalance ?? safeRaw.accountsReceivable ?? safeRaw.accountsReceivableBalance),
    collateralValue: toNumber(safeRaw.fixedAssetsValue ?? safeRaw.collateralValue ?? safeRaw.fixedAssetsValue),
  };
}

function persistIntake(i: Intake) {
  const jsonStr = JSON.stringify(i);
  sessionStorage.setItem('bf:intake', jsonStr);
  localStorage.setItem('bf:intake', jsonStr); // belt-and-suspenders
  (window as any).__step2 = { ...(window as any).__step2, intake: i };
  
  // VERIFY storage immediately
  const verification = {
    sessionStored: sessionStorage.getItem('bf:intake'),
    localStored: localStorage.getItem('bf:intake'),
    canParse: JSON.parse(sessionStorage.getItem('bf:intake') || '{}')
  };
  console.log('🔍 [persistIntake] Storage verification:', verification);
}

// Call this when Step-1 completes:
export function onStep1Submit(raw:any, navigateToStep2: () => void){
  console.log('🔍 [onStep1Submit] Raw input:', raw);
  const intake = normalizeIntake(raw);
  console.log('🔍 [onStep1Submit] Normalized intake:', intake);
  persistIntake(intake);
  console.log('🔍 [onStep1Submit] Stored to both session+local storage');
  
  // Add small delay to ensure storage is complete before navigation
  setTimeout(() => {
    console.log('🔍 [onStep1Submit] Navigating to Step 2 after storage delay...');
    navigateToStep2();  // SPA navigation — no full reload
  }, 100);
}

export function normalize(raw: Partial<ApplicationForm>): ApplicationForm {
  return {
    requestedAmount: toNum(raw.requestedAmount ?? raw.fundingAmount ?? (raw as any).howMuchFunding),
    fundingAmount:   toNum(raw.fundingAmount ?? raw.requestedAmount),
    businessLocation: raw.businessLocation ?? (raw as any).location,
    industry: raw.industry,
    purpose: raw.purpose ?? (raw as any).purposeOfFunds,
    yearsInBusiness: raw.yearsInBusiness ?? (raw as any).yearsHistory,
    last12moRevenue: toNum(raw.last12moRevenue ?? (raw as any).last12MonthsRevenue),
    avgMonthlyRevenue: toNum(raw.avgMonthlyRevenue ?? (raw as any).avgMonthly),
    arBalance: toNum(raw.arBalance ?? (raw as any).currentAR),
    fixedAssets: toNum(raw.fixedAssets ?? (raw as any).fixedAssetsValue),
  };
}

type Ctx = {
  data: ApplicationForm | null;
  save: (d: Partial<ApplicationForm>) => void;
  clear: () => void;
  isComplete: boolean;
};
const Ctx = createContext<Ctx | null>(null);

export function FormDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ApplicationForm | null>(() => {
    try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { return null; }
  });

  const save = (raw: Partial<ApplicationForm>) => {
    const merged = normalize({ ...(data ?? {}), ...raw });
    setData(merged);
  };

  const clear = () => setData(null);

  useEffect(() => {
    if (data) sessionStorage.setItem(KEY, JSON.stringify(data));
    else sessionStorage.removeItem(KEY);
  }, [data]);

  const isComplete = !!(data?.requestedAmount ?? data?.fundingAmount);

  const value = useMemo(() => ({ data, save, clear, isComplete }), [data, isComplete]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useFormData = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFormData outside provider");
  return v;
};

// Legacy compatibility export for existing components
export const useFormDataContext = useFormData;