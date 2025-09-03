export function deepGet(obj: any, path: string) {
  return path.split(".").reduce((a, k) => (a && a[k] !== undefined ? a[k] : undefined), obj);
}

export function present(v: any) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "number") return !Number.isNaN(v);
  if (typeof v === "object") return Object.keys(v).length > 0;
  return !!v;
}