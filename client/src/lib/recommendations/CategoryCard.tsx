import React from 'react';

type Props = {
  id: string;            // slug, e.g., 'line_of_credit'
  title: string;         // display name
  meta?: string;         // e.g., "8 products available · Market share — 47%"
  matchPct?: number;     // 0-100
  selected: boolean;
  onSelect: () => void;
};

export default function CategoryCard({ id, title, meta, matchPct, selected, onSelect }: Props) {
  return (
    <div
      data-testid={`card-${id}`}
      className={`rounded-xl border ${selected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'} p-5 flex items-center justify-between gap-6`}
      role="region"
      aria-label={title}
    >
      <div className="flex-1">
        <div className="text-[17px] font-semibold text-slate-900">{title}</div>
        {meta && <div className="text-[13px] text-slate-600 mt-1">{meta}</div>}
      </div>

      {typeof matchPct === 'number' && (
        <div className="hidden sm:flex items-center gap-2 text-[12px] text-slate-600">
          <span className="font-medium">{Math.round(matchPct)}% Match</span>
        </div>
      )}

      <div className="shrink-0">
        <button
          type="button"
          data-testid={`cat-${id}`}
          aria-pressed={selected}
          className={`px-3.5 py-2 rounded-lg text-[13px] font-medium border transition
            ${selected
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(); }}
        >
          {selected ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );
}