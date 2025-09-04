import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
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

  // Debounced persistence to prevent race conditions
  const debouncedPersist = useDebouncedCallback((canonData: ApplicationV1) => {
    try { 
      localStorage.setItem(KEY, JSON.stringify(canonData));
      // Also maintain bf:intake for backward compatibility
      localStorage.setItem('bf:intake', JSON.stringify(canonData));
    } catch {}
  }, 200);

  // persist on change with debounce
  useEffect(() => {
    debouncedPersist(canon);
  }, [canon, debouncedPersist]);

  // visible, unmistakable boot log
  useEffect(() => {
    console.info('[CANON] bootstrap OK. keys=', Object.keys(canon));
  }, []);

  return <Ctx.Provider value={{ canon, setCanon }}>{children}</Ctx.Provider>;
}

export const useCanon = () => useContext(Ctx);