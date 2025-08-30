import { useEffect, useState } from "react";
import { fetchRequiredDocs, type RequiredDoc } from "../api/requiredDocs";
import { normalizeDocs } from "./normalize";

type Params = { productId?: string; lenderId?: string };
export function useRequiredDocs({ productId, lenderId }: Params) {
  const [docs, setDocs] = useState<RequiredDoc[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const raw = await fetchRequiredDocs({ productId, lenderId });
        const norm = normalizeDocs(raw);
        if (ok) setDocs(norm);
      } catch (e:any) { if (ok) setError(e); }
    })();
    return () => { ok = false; };
  }, [productId, lenderId]);
  return { docs, error, loading: docs===null && error===null };
}