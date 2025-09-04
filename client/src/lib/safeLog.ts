const PROD = import.meta.env?.PROD ?? false;
export const safeLog  = (...a: any[]) => { if (!PROD) console.log(...a); };
export const safeWarn = (...a: any[]) => { if (!PROD) console.warn(...a); };
export const safeError = (...a: any[]) => { if (!PROD) console.error(...a); };