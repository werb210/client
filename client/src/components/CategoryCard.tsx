import React from "react";
import type { CategoryGroup } from "../lib/categories";

type Props = {
  group: CategoryGroup;
  selected?: boolean;
  onSelect: (key: string) => void;
};
export default function CategoryCard({ group, selected, onSelect }: Props) {
  return (
    <div className="category-card-wrapper relative">
      <button
        type="button"
        data-testid={`cat-${group.key}`}
        onClick={() => onSelect(group.key)}
        className={[
          "w-full text-left card mb-3 transition rounded-xl border",
          "px-5 py-4",
          selected 
            ? "border-emerald-400 ring-2 ring-emerald-300 bg-emerald-50" 
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
          "pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        ].join(' ')}
        aria-pressed={selected}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{group.label}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {group.products.length} products available · {group.percentage}% match
            </p>
          </div>
          <span 
            className={[
              "inline-flex items-center rounded-full px-3 py-1 text-sm",
              selected ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
            ].join(' ')}
          >
            {selected ? 'Selected' : 'Select'}
          </span>
        </div>
      </button>
    </div>
  );
}
