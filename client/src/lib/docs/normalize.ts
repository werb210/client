import type { RequiredDoc } from "../api/requiredDocs";
export function normalizeDocs(docs: RequiredDoc[]): RequiredDoc[] {
  const map = new Map<string, RequiredDoc>();
  for (const d of docs) {
    const k = d.key.trim().toLowerCase();
    const prev = map.get(k);
    // product > lender > master priority already applied server-side, this just dedupes
    if (!prev) map.set(k, d);
  }
  // stable UX ordering: product first, then lender, then master
  const weight = (s?:string)=> s==="product"?0 : s==="lender"?1 : 2;
  return [...map.values()].sort((a,b)=> weight(a.source)-weight(b.source) || a.key.localeCompare(b.key));
}