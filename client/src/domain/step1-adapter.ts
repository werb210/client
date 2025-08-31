export type Step1Canonical = { amount: number; country: string; };
const parseNum = (v:any):number => {
  if (v==null) return 0;
  const s = (typeof v==='number')? String(v) : String(v);
  const n = Number(s.replace(/[$,_\s]/g,''));
  return Number.isFinite(n)? n : 0;
};
const toCC = (v:any):string => {
  const s = (v??'').toString().trim().toUpperCase();
  if (!s) return "NA";
  if (["CA","CANADA"].includes(s)) return "CA";
  if (["US","USA","UNITED STATES","U.S.","U.S.A."].includes(s)) return "US";
  return s.length===2 ? s : "NA";
};
/** Accepts any Step-1-ish payload and returns the fields Step 2 & 5 actually use. */
export function normalizeStep1(d:any): Step1Canonical {
  const amount =
    parseNum(d?.amountRequested)   ||
    parseNum(d?.loanAmount)        ||
    parseNum(d?.requestedAmount)   ||
    parseNum(d?.requested_amount)  ||
    parseNum(d?.amount)            ||
    parseNum(d?.fundsNeeded)       ||
    parseNum(d?.fundingAmount)     ||
    parseNum(d?.loan_size)         || 0;
  const country =
    toCC(d?.country) || toCC(d?.countryCode) || toCC(d?.applicantCountry) || toCC(d?.region) || "NA";
  return { amount, country };
}

/** Required-docs normalizer used by Step 5 */
export function normalizeRequiredDocsShape(resp:any): string[] {
  if (Array.isArray(resp)) return resp;
  if (resp && Array.isArray(resp.required_documents)) return resp.required_documents;
  if (resp && Array.isArray(resp.items)) return resp.items;
  return [];
}
