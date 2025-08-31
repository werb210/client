import React from 'react';

type Stats = { products: number; marketSharePct: number; matchPct: number };
type Props = { category: string; stats: Stats; selected: boolean; onSelect: (c: string)=>void };

export default function CategoryCard({ category, stats, selected, onSelect }: Props) {
  const { products, marketSharePct, matchPct } = stats;
  return (
    <div className="category-card-wrapper">
      <button
        type="button"
        data-testid={`cat-${category}`}
        aria-pressed={selected}
        onClick={() => onSelect(category)}
        className={[
          "w-full text-left rounded-xl border px-5 py-4 transition pointer-events-auto",
          selected
            ? "border-emerald-400 ring-2 ring-emerald-300 bg-emerald-50"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-slate-900 font-semibold">{category}</div>
            <div className="mt-1 text-slate-600 text-sm">
              {products} {products === 1 ? 'product' : 'products'} available · Market share ~{marketSharePct}% · Match {matchPct}%
            </div>
            <ul className="mt-2 text-sm text-emerald-700 list-disc ml-5">
              <li>Matches your funding requirement</li>
              <li>Available in your region</li>
            </ul>
          </div>
          <span className={[
            "inline-flex items-center rounded-full px-3 py-1 text-sm",
            selected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
          ].join(' ')}>{selected ? 'Selected' : 'Select'}</span>
        </div>
      </button>
    </div>
  );
}