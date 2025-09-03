/**
 * Returns a shallow JSON snapshot of the full application form state for lossless carriage.
 * Do NOT include files/blobs here; keep only names/types/urls and simple scalars.
 */
export function getFormSnapshot(state: any){
  if (!state || typeof state !== 'object') return {};
  // Strip functions/blobs
  const prune = (v:any): any => {
    if (v===null || v===undefined) return v;
    if (Array.isArray(v)) return v.map(prune);
    if (typeof v === 'object') {
      const out: any = {};
      for (const k of Object.keys(v)) {
        const val = v[k];
        if (typeof val === 'function') continue;
        if (typeof val === 'object' && val && (val instanceof File || val instanceof Blob)) continue;
        out[k] = prune(val);
      }
      return out;
    }
    return v;
  };
  return prune(state);
}