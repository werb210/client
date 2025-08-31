import React from "react";
import type { CategoryGroup } from "../lib/categories";

type Props = {
  group: CategoryGroup;
  selected?: boolean;
  onSelect: (key: string) => void;
};
export default function CategoryCard({ group, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(group.key)}
      className={`w-full text-left rounded-2xl border p-4 mb-3 transition
        ${selected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"}`}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{group.label}</h3>
        <span className="text-sm text-gray-500">{group.percentage}% match</span>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        {group.products.length} products available
      </p>
    </button>
  );
}
