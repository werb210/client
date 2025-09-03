import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CanonKey } from "./aliases";
import { ALIASES } from "./aliases";
import { deepGet, present } from "./utils";

type CanonData = Partial<Record<CanonKey, any>>;

type CanonState = {
  data: CanonData;
  get: <T = any>(key: CanonKey, ...sources: any[]) => T | undefined;
  set: (key: CanonKey, value: any) => void;
  setMany: (kv: CanonData) => void;
};

export const useCanon = create<CanonState>()(
  persist(
    (set, get) => ({
      data: {},
      get: (key, ...sources) => {
        const state = get().data;
        if (present(state[key])) return state[key];
        for (const path of ALIASES[key] || []) {
          for (const src of sources) {
            const v = deepGet(src, path);
            if (present(v)) return v;
          }
        }
        return undefined;
      },
      set: (key, value) => set(s => ({ data: { ...s.data, [key]: value } })),
      setMany: (kv) => set(s => ({ data: { ...s.data, ...kv } }))
    }),
    { name: "bf:canonical" }
  )
);