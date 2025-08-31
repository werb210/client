import React, { useEffect, useMemo, useState } from 'react';
import CategoryCard from '../../../lib/recommendations/CategoryCard';
import '../../../styles/step2.css';

const STORAGE_KEY = 'bf:step2:category';

// Try to read pre-computed categories if your page injects them for debugging.
// Fallback to a safe default list with the 6 categories you specified.
function getAvailableCategories(): Array<{ id: string; title: string; meta?: string; matchPct?: number; }> {
  // window.__step2?.categories example: [{ id:'line_of_credit', title:'Line of Credit', meta:'8 products · 47% share', matchPct:84 }, ...]
  const injected = (window as any).__step2?.categories;
  if (Array.isArray(injected) && injected.length) return injected;

  return [
    { id: 'line_of_credit',        title: 'Line of Credit',        meta: '19 products available', matchPct: 84 },
    { id: 'term_loan',             title: 'Term Loan',             meta: '8 products available',  matchPct: 78 },
    { id: 'invoice_factoring',     title: 'Invoice Factoring',     meta: '6 products available',  matchPct: 75 },
    { id: 'equipment_financing',   title: 'Equipment Financing',   meta: '6 products available',  matchPct: 79 },
    { id: 'purchase_order',        title: 'Purchase Order Financing', meta: '2 products available', matchPct: 70 },
    { id: 'working_capital',       title: 'Working Capital',       meta: '1 product available',   matchPct: 72 },
  ];
}

export default function Step2ChooseCategory() {
  const cats = useMemo(getAvailableCategories, []);
  const [selected, setSelected] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  // Harden against overlays stealing clicks
  useEffect(() => {
    document.documentElement.setAttribute('data-step', '2');
    return () => document.documentElement.removeAttribute('data-step');
  }, []);

  // Single source of truth for saving selection
  const selectCategory = (id: string) => {
    setSelected(id);
    localStorage.setItem(STORAGE_KEY, id);
    document.dispatchEvent(new CustomEvent('bf:categorySelected', { detail: { id } }));
    console.log('[Step2] Category clicked:', id);
    console.log('[Step2] Saved to localStorage:', localStorage.getItem(STORAGE_KEY));
  };

  const canContinue = Boolean(selected);

  const onContinue = () => {
    if (!selected) return;
    // If you have a global app context, also mirror the selection there to feed Step 3.
    // window.__app?.set?.('productCategory', selected);
    // Navigate using your router if available; otherwise, a safe fallback:
    window.location.assign('/apply/step-3');
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0 py-8 space-y-6" data-step="2">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Step 2: Choose Product Category</h1>
        <p className="text-[14px] text-slate-600">Select the type of financing that best fits your business needs.</p>
      </header>

      <section className="space-y-4">
        {cats.map(c => (
          <CategoryCard
            key={c.id}
            id={c.id}
            title={c.title}
            meta={c.meta}
            matchPct={c.matchPct}
            selected={selected === c.id}
            onSelect={() => selectCategory(c.id)}
          />
        ))}
      </section>

      <footer className="pt-3 flex items-center justify-between">
        <button
          type="button"
          className="px-3.5 py-2 rounded-lg text-[13px] font-medium border bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
          onClick={() => window.history.back()}
          data-testid="step2-prev"
        >
          Previous
        </button>

        <button
          type="button"
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition
            ${canContinue ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
          disabled={!canContinue}
          onClick={onContinue}
          data-testid="step2-continue"
        >
          Continue
        </button>
      </footer>
    </main>
  );
}
