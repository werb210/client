import { useCanon } from "./store";
import type { CanonKey } from "./aliases";

/** Use in any component:
 *  const [val, setVal] = useCanonField('legalName', legacySourceObj);
 */
export function useCanonField<T = any>(key: CanonKey, ...legacySources: any[]) {
  const get = useCanon(s => s.get);
  const set = useCanon(s => s.set);
  const value = get<T>(key, ...legacySources);
  const setter = (v: T) => set(key, v);
  return [value as T, setter] as const;
}