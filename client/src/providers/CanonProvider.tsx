import React, { createContext, useContext, useEffect, useState } from 'react';

type Canon = {
  intent?: { fundingType?: string; amount?: number };
  business?: { country?: string; industry?: string };
  metrics?: { revenue12m?: string; monthlyRevenue?: string; yearsHistory?: string };
  // Complete Step 1 fields for compatibility - exact form types
  businessLocation?: "US" | "CA";
  headquarters?: "US" | "CA";
  headquartersState?: string;
  industry?: string;
  lookingFor?: "capital" | "equipment" | "both";
  fundingAmount?: number;
  fundsPurpose?: "equipment" | "working_capital" | "inventory" | "expansion";
  salesHistory?: "<1yr" | "1-3yr" | "3+yr";
  revenueLastYear?: number;
  averageMonthlyRevenue?: number;
  accountsReceivableBalance?: number;
  fixedAssetsValue?: number;
  equipmentValue?: number;
};

const KEY = 'bf:canon:v1';

const Ctx = createContext<{
  canon: Canon;
  setCanon: (patch: Partial<Canon>) => void;
}>({ canon: {}, setCanon: () => {} });

export function CanonProvider({ children }: { children: React.ReactNode }) {
  const [canon, setCanonState] = useState<Canon>(() => {
    try { 
      // Also try to migrate from old bf:intake key
      const legacy = localStorage.getItem('bf:intake');
      const canonical = localStorage.getItem(KEY);
      if (canonical) {
        return JSON.parse(canonical);
      } else if (legacy) {
        const legacyData = JSON.parse(legacy);
        return legacyData; // Migrate old format
      }
      return {};
    } catch { 
      return {}; 
    }
  });

  const setCanon = (patch: Partial<Canon>) =>
    setCanonState(prev => ({ ...prev, ...patch }));

  // persist on change
  useEffect(() => {
    try { 
      localStorage.setItem(KEY, JSON.stringify(canon));
      // Also maintain bf:intake for backward compatibility
      localStorage.setItem('bf:intake', JSON.stringify(canon));
    } catch {}
  }, [canon]);

  // visible, unmistakable boot log
  useEffect(() => {
    console.info('[CANON] bootstrap OK. keys=', Object.keys(canon));
  }, []);

  return <Ctx.Provider value={{ canon, setCanon }}>{children}</Ctx.Provider>;
}

export const useCanon = () => useContext(Ctx);