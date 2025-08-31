import React from "react";
import { getProducts } from "../api/products";
import { useLenders } from "../features/lenders/useLenders";
export default function LendersDirectory() {
  const { data, loading, err } = useLenders({ active:true });
  if (loading) return <div>Loading lenders…</div>;
  if (err) return <div>Error loading lenders.</div>;
  const products = await getProducts();
return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-3">Lenders</h1>
      <ul className="space-y-2">
        {data?.map(l => (
          <li key={l.id} className="border rounded p-3">
            <div className="font-medium">{l.name}</div>
            <div className="text-sm opacity-80">{l.website || "—"} • {l.country || "—"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}