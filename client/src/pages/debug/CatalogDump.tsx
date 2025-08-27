import { useEffect, useState } from "react";
import { fetchCatalogNormalized, CanonicalProduct } from "@/lib/catalog";

export default function CatalogDump(){
  const [rows,setRows]=useState<CanonicalProduct[]>([]);
  useEffect(()=>{ fetchCatalogNormalized().then(setRows).catch(()=>setRows([])); },[]);
  if (!rows.length) return <div>Loading catalog…</div>;
  
  const fields: (keyof CanonicalProduct)[] = ["id","name","lender_id","lender_name","country","category","min_amount","max_amount","interest_rate_min","interest_rate_max","term_min","term_max","active","required_documents"];
  
  return (
    <div style={{fontFamily:"ui-monospace",padding:16}}>
      <h1>Catalog Dump (Canonical Fields)</h1>
      <p>Showing {rows.length} products from canonical catalog system</p>
      {rows.map((p,i)=>(
        <div key={p.id} style={{border:"1px solid #ddd",borderRadius:12,margin:"12px 0",padding:12}}>
          <div style={{fontWeight:700,marginBottom:8}}>{i+1}. {p.name} — {p.lender_name}</div>
          {fields.map(f=>(
            <div key={String(f)} style={{marginBottom:4}}>
              <strong style={{color:"#0366d6"}}>{String(f)}:</strong>{" "}
              <span style={{fontFamily:"monospace"}}>
                {f==="required_documents" ? JSON.stringify(p[f]) : String((p as any)[f] ?? "")}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}