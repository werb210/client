import React, { useEffect, useMemo, useState } from "react";
import { summarizeCategories, Product, CategorySummary } from "../../api/categories";

// Local-first product loader: prefer your existing fetcher if present.
async function loadProducts(): Promise<Product[]> {
  try {
    const r = await fetch("/api/v1/products", { credentials:"same-origin" });
    if (r.ok) return r.json();
  } catch {}
  // fallback if your API returns a wrapped shape
  try {
    const r = await fetch("/api/v1/products", { credentials:"same-origin" });
    if (r.ok) {
      const j = await r.json();
      if (Array.isArray(j.items)) return j.items;
    }
  } catch {}
  return [];
}

const LS_KEY = "bf:step2:categories";

export default function CategoryMode() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    loadProducts().then(setProducts);
  }, []);

  const summaries = useMemo(() => summarizeCategories(products), [products]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(selected));
    // expose for debugging
    (window as any).__step2_cat = { selected, available: summaries };
  }, [selected, summaries]);

  function toggle(key: string) {
    setSelected(s => s.includes(key) ? s.filter(x=>x!==key) : [...s, key]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h2 className="text-xl font-semibold mb-2">Choose product category</h2>
      <p className="text-sm text-gray-600 mb-4">
        Pick one or more categories. We'll tailor docs (Step 5) and the downstream export accordingly.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {summaries.map(s => (
          <button
            key={s.key}
            onClick={()=>toggle(s.key)}
            className={[
              "rounded-xl border p-4 text-left transition",
              selected.includes(s.key) ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <div className="text-base font-medium">{s.label}</div>
              <input type="checkbox" checked={selected.includes(s.key)} readOnly />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {s.count} products • {s.lenders} lenders
              { (s.minAmount!=null || s.maxAmount!=null) && (
                <> • range: ${s.minAmount ?? "?"}–${s.maxAmount ?? "?"}</>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-700">
        Selected: {selected.length ? selected.join(", ") : "None"}
      </div>
    </div>
  );
}
