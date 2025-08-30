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

const KEY = "bf:intake:v2";

function toNum(x: any) {
  if (x == null) return undefined;
  if (typeof x === "number") return x;
  // strip $, commas, spaces
  const n = Number(String(x).replace(/[$, ]/g, ""));
  return Number.isFinite(n) ? n : undefined;
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