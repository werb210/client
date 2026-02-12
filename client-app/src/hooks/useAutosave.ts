import { useEffect } from "react";

export function useAutosave(key: string, data: unknown) {
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data));
  }, [key, data]);
}
