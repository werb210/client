import { useEffect, useState } from "react";

export function useDraft<T>(key: string, initialState: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(key);
    } catch {}
  };

  return { state, setState, clearDraft };
}
