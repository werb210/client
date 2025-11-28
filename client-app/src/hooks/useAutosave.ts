import { useEffect, useRef } from "react";
import { useApplicationStore } from "@/state/applicationStore";
import { useAuth } from "@/state/auth";

export function useAutosave(section: string, deps: any[]) {
  const save = useApplicationStore((s) => s.saveToServer);
  const token = useAuth((s) => s.token);

  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      save(token);
    }, 1500);

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, save, token, section]);
}
