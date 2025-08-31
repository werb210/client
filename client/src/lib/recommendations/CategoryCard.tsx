import React from "react";

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  scorePct?: number;      // 0–100
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function CategoryCard({
  id, title, subtitle, scorePct, selected, onSelect,
}: Props) {
  return (
    <li
      className={`step2-card relative rounded-xl border ${selected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"} transition-shadow`}
      // Kill any parent overlay that might intercept pointer events
      style={{ isolation: "isolate" }}           // creates a new stacking context
      data-testid={`cat-${id}`}
    >
      {/* FULL-CARD BUTTON (covers the tile; always on top) */}
      <button
        type="button"
        onClick={() => onSelect(id)}
        className="absolute inset-0 block w-full h-full rounded-xl focus-visible:outline-2 focus-visible:outline-emerald-600"
        style={{ zIndex: 50, pointerEvents: "auto" }}     // <- defeats overlays
        aria-label={`Select ${title}`}
      />
      {/* CONTENT LAYER below the button (but pointer events still reach button above) */}
      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-slate-900 font-semibold">{title}</h3>
            {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
          </div>
          <div className="shrink-0">
            {selected ? (
              <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-medium">
                Selected
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs">
                Select
              </span>
            )}
          </div>
        </div>
        {typeof scorePct === "number" && (
          <div className="mt-3 text-xs text-slate-500">{scorePct}% Match</div>
        )}
      </div>
    </li>
  );
}