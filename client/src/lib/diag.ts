export type ProvTag = { source: 'db' | 'alias' | 'computed' | 'fallback'; kind?: 'null'|'const'|'coalesce'; note?: string };
export type WithProv<T> = T & { _prov?: Record<string, ProvTag> };

export function wantDiag(): boolean {
  try { return (globalThis.localStorage?.getItem('CATALOG_DIAG') === '1'); } catch { return false; }
}

export function withDiagUrl(url: string): string {
  if (!wantDiag()) return url;
  return url.includes('?') ? url + '&diag=1' : url + '?diag=1';
}

export function mergeClientProv<T extends Record<string, any>>(obj: T, clientProv?: Record<string, ProvTag>): WithProv<T> {
  if (!clientProv) return obj as WithProv<T>;
  const merged = { ...(obj as any) };
  merged._prov = Object.assign({}, obj && (obj as any)._prov || {}, clientProv || {});
  return merged;
}

export function downloadJSON(name: string, data: any) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  } catch {}
}

export function summarizeProv(list: Array<{_prov?: Record<string, ProvTag>}>){
  const counts: Record<string, number> = {};
  for(const r of list){
    if(!r || !r._prov) continue;
    for(const [field, tag] of Object.entries(r._prov)){
      const key = `${field}:${tag.source}${tag.kind?':'+tag.kind:''}`;
      counts[key] = (counts[key]||0)+1;
    }
  }
  return counts;
}