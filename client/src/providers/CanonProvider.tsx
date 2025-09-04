import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApplicationV1 } from '../../../shared/ApplicationV1';

const KEY = 'bf:canon:v1';

const Ctx = createContext<{
  canon: ApplicationV1;
  setCanon: (patch: Partial<ApplicationV1>) => void;
}>({ canon: {}, setCanon: () => {} });

export function CanonProvider({ children }: { children: React.ReactNode }) {
  const [canon, setCanonState] = useState<ApplicationV1>(() => {
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

  const setCanon = (patch: Partial<ApplicationV1>) =>
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