import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CategoryCard from '../../../lib/recommendations/CategoryCard'; // adjust if your path differs

const LS_KEY = 'bf:step2:category';

type CategoryStats = { products: number; marketSharePct: number; matchPct: number };

export default function Step2_Recommendations() {
  const categories: Array<{ name: string; stats: CategoryStats }> = [
    { name: 'Line of Credit',              stats: { products: 19, marketSharePct: 47, matchPct: 84 } },
    { name: 'Term Loan',                   stats: { products:  8, marketSharePct: 22, matchPct: 77 } },
    { name: 'Invoice Factoring',           stats: { products:  6, marketSharePct: 18, matchPct: 75 } },
    { name: 'Equipment Financing',         stats: { products:  6, marketSharePct: 29, matchPct: 79 } },
    { name: 'Purchase Order Financing',    stats: { products:  2, marketSharePct:  3, matchPct: 71 } },
    { name: 'Working Capital',             stats: { products:  1, marketSharePct:  6, matchPct: 72 } },
  ];

  const [selected, setSelected] = useState<string | null>(null);

  // Load previously chosen category
  useEffect(() => {
    try { const v = localStorage.getItem(LS_KEY); if (v) setSelected(JSON.parse(v)); } catch {}
  }, []);

  const handleSelect = useCallback((cat: string) => {
    setSelected(cat);
    try { localStorage.setItem(LS_KEY, JSON.stringify(cat)); } catch {}
    // Optional: sync to any app-wide store if present
    try { (window as any).__app?.update?.((s: any) => ({ ...s, productCategory: cat })); } catch {}
  }, []);

  const canContinue = useMemo(() => Boolean(selected), [selected]);

  return (
    <div className="mx-auto max-w-4xl categories-layer">
      <h2 className="text-center text-2xl font-semibold text-slate-800 mb-2">Step 2: Choose Product Category</h2>
      <p className="text-center text-slate-600 mb-8">Select the type of financing that best fits your business needs</p>

      <div className="space-y-4" onClickCapture={() => { /* ensure we receive events */ }}>
        {categories.map(({ name, stats }) => (
          <CategoryCard
            key={name}
            category={name}
            stats={stats}
            selected={selected === name}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-8">
        <a className="btn btn-secondary" href="/apply/step-1">Previous</a>
        <button
          type="button"
          className={["btn", canContinue ? "btn-primary" : "btn-disabled"].join(' ')}
          disabled={!canContinue}
          onClick={() => { if (canContinue) window.location.href = "/apply/step-3"; }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}