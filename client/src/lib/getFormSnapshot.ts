export function getFormSnapshot(state: any){
  if (!state || typeof state !== 'object') return {};
  const prune = (v:any): any => {
    if (v===null || v===undefined) return v;
    if (Array.isArray(v)) return v.map(prune);
    if (typeof v === 'object') {
      const out: any = {};
      for (const k of Object.keys(v)) {
        const val = v[k];
        if (typeof val === 'function') continue;
        // Drop binary objects to avoid large payloads
        if ((typeof File!=="undefined" && val instanceof File) || (typeof Blob!=="undefined" && val instanceof Blob)) continue;
        out[k] = prune(val);
      }
      return out;
    }
    return v;
  };
  return prune(state);
}