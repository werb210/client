import { useSyncExternalStore } from "react";

type MayaSessionState = {
  funding_amount: string | number | null;
  annual_revenue: string | number | null;
  time_in_business: string | null;
  product_type: string | null;
  industry: string | null;
};

type MayaSessionStore = MayaSessionState & {
  setField: (field: string, value: unknown) => void;
};

const state: MayaSessionState = {
  funding_amount: null,
  annual_revenue: null,
  time_in_business: null,
  product_type: null,
  industry: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const store: MayaSessionStore = {
  ...state,
  setField(field: string, value: unknown) {
    Object.assign(state, { [field]: value });
    Object.assign(store, state);
    emitChange();
  },
};

export function useMayaSession<T = MayaSessionStore>(selector?: (session: MayaSessionStore) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => (selector ? selector(store) : (store as unknown as T)),
    () => (selector ? selector(store) : (store as unknown as T))
  );
}
