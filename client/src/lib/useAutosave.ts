import { useEffect, useRef } from "react";

export function useAutosave<T>(key: string, data: T, delay = 300) {
  const t = useRef<number | undefined>(undefined);
  const last = useRef<string>("");

  function writeNow(obj: T) {
    const s = JSON.stringify(obj);
    if (s === last.current) return;
    last.current = s;
    localStorage.setItem(key, s);
  }

  useEffect(() => {
    // debounce
    window.clearTimeout(t.current);
    // @ts-ignore
    t.current = window.setTimeout(() => writeNow(data), delay);
    return () => window.clearTimeout(t.current);
  }, [key, data, delay]);

  useEffect(() => {
    const flush = () => writeNow(data);
    window.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [data, key]);
}