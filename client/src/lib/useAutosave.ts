import { useEffect, useRef } from "react";

export function useAutosave<T>(key: string, data: T, delay = 300) {
  const t = useRef<number>();
  const last = useRef<string>("");
  
  const write = () => {
    const s = JSON.stringify(data);
    if (s !== last.current) { 
      last.current = s; 
      localStorage.setItem(key, s); 
    }
  };
  
  useEffect(() => { 
    clearTimeout(t.current); 
    t.current = window.setTimeout(write, delay) as any; 
    return () => clearTimeout(t.current); 
  }, [key, data, delay]);
  
  useEffect(() => {
    const flush = () => write();
    window.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [data, key]);
}