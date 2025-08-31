import { useEffect, useState } from "react";
import { fetchProducts } from "../../api/products";

export type Lender = {
  id: string; name: string; legal_name?: string|null; slug?: string|null;
  website?: string|null; contact_email?: string|null; contact_phone?: string|null;
  country?: string|null; is_active: boolean;
};

export function useLenders(params?: { q?: string; country?: string; active?: boolean }) {
  const [data,setData]=useState<Lender[]|null>(null); const [err,setErr]=useState<Error|null>(null);
  useEffect(()=>{ let on=true; (async()=>{
    try {
      const products = await fetchProducts();
      // Convert products to lender format for compatibility
      const lenders = products.map(p => ({
        id: p.id || p.name || 'unknown',
        name: p.lenderName || p.lender_name || p.name || 'Unknown Lender',
        legal_name: p.lenderName || p.lender_name,
        slug: null,
        website: null,
        contact_email: null, 
        contact_phone: null,
        country: p.country,
        is_active: true
      })) as Lender[];
      
      // Apply filters if provided
      let filtered = lenders;
      if(params?.country) filtered = filtered.filter(l => l.country === params.country);
      if(params?.active !== undefined) filtered = filtered.filter(l => l.is_active === params.active);
      if(params?.q) filtered = filtered.filter(l => l.name.toLowerCase().includes(params.q!.toLowerCase()));
      
      if(on) setData(filtered);
    } catch(e:any) { if(on) setErr(e); }
  })();
  return ()=>{on=false}; },[params?.q,params?.country,params?.active]);
  return { data, err, loading: data===null && !err };
}