import React from "react";

type Props = {
  id: string;
  title: string;
  subtitle?: string;
  scorePct?: number;
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function CategoryCard({
  id, title, subtitle, scorePct, selected, onSelect,
}: Props) {
  return (
    <li
      data-step2-card={id}
      className={`step2-card relative rounded-xl border ${selected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"} transition`}
      style={{ isolation: "isolate" }}               // new stacking context
    >
      {/* FULL-CARD HIT AREA — always on top */}
      <button
        type="button"
        className="step2-hit absolute inset-0 rounded-xl"
        style={{ zIndex: 60, pointerEvents: "auto" }}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} // beat overlays
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(id); }}
        aria-label={`Select ${title}`}
      />
      {/* Card content (non-interactive; clicks pass through) */}
      <div className="relative z-10 step2-content p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-slate-900 font-semibold">{title}</h3>
            {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
          </div>
          <div className="shrink-0">
            {selected ? (
              <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-medium">Selected</span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs">Select</span>
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