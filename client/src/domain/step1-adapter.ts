export type Step1Canonical={amount:number;country:string};
const num=(v:any)=>{if(v==null)return 0;const s=(typeof v==='number')?String(v):String(v);const n=Number(s.replace(/[$,_\s]/g,''));return Number.isFinite(n)?n:0};
const cc=(v:any)=>{const s=(v??'').toString().trim().toUpperCase();if(!s)return"NA";if(["CA","CANADA"].includes(s))return"CA";if(["US","USA","UNITED STATES","U.S.","U.S.A."].includes(s))return"US";return s.length===2?s:"NA"};
export function normalizeStep1(d:any):Step1Canonical{
  const amount=num(d?.amountRequested)||num(d?.loanAmount)||num(d?.requestedAmount)||num(d?.requested_amount)||num(d?.amount)||num(d?.fundsNeeded)||num(d?.fundingAmount)||num(d?.loan_size)||0;
  const country=cc(d?.country)||cc(d?.countryCode)||cc(d?.applicantCountry)||cc(d?.region)||"NA";
  return{amount,country};
}
export function normalizeRequiredDocsShape(resp:any):string[]{ if(Array.isArray(resp))return resp; if(resp?.required_documents) return resp.required_documents; if(resp?.items) return resp.items; return []; }
