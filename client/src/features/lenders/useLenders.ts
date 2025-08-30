import { useEffect, useState } from "react";
import { listLenders, type Lender } from "../../lib/api/lenders";
export function useLenders(params?: { q?: string; country?: string; active?: boolean }) {
  const [data,setData]=useState<Lender[]|null>(null); const [err,setErr]=useState<Error|null>(null);
  useEffect(()=>{ let on=true; (async()=>{ try{ const rows=await listLenders(params); if(on) setData(rows); }catch(e:any){ if(on) setErr(e);} })(); return ()=>{on=false}; },[params?.q,params?.country,params?.active]);
  return { data, err, loading: data===null && !err };
}