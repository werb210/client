import React, { useEffect, useMemo, useState } from "react";
import CategoryCard from "@/lib/recommendations/CategoryCard";
import { useFormData } from "@/context/FormDataContext";

type Category = {
  id: string;              // "line_of_credit" etc.
  name: string;            // "Line of Credit"
  score: number;           // 0–100 (computed)
  products: number;        // count within category
  subtitle?: string;
};

const STORAGE_KEY = "bf:step2:category";

export default function Step2() {
  const { data, save } = useFormData(); // ensure Continue reads from here
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  // Build categories once from the unified products list
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await fetch("/api/v1/products");
        if (!response.ok) throw new Error("Failed to load products");
        const products = await response.json();
        
        // group → score → sort
        const map = new Map<string, Category>();
        for (const p of products) {
          const cat = p.category as string;   // e.g., "line_of_credit"
          if (!cat) continue;
          if (!map.has(cat)) {
            map.set(cat, { id: cat, name: titleize(cat), score: 0, products: 0 });
          }
          const entry = map.get(cat)!;
          entry.products += 1;
          entry.score += scoreProduct(p);     // simple additive scoring from your rules
        }
        const list = [...map.values()]
          .map(c => ({ ...c, score: Math.round(c.score / Math.max(1, c.products)) }))
          .sort((a, b) => b.score - a.score);

        if (!alive) return;
        setCategories(list);

        // Default selection: storage if valid, else highest score
        const saved = localStorage.getItem(STORAGE_KEY);
        const valid = saved && list.some(c => c.id === saved) ? saved! : null;
        const pick = valid ?? (list[0]?.id ?? null);
        if (pick) {
          selectCategory(pick, list, false); // no toast/log on first mount
        }
      } catch (error) {
        console.error("[Step2] Failed to load products:", error);
      }
    })();
    return () => { alive = false; };
  }, []);

  function selectCategory(id: string, list = categories, announce = true) {
    setSelected(id);
    localStorage.setItem(STORAGE_KEY, id);
    // Update FormData context so Step 3+ can read it
    save({ selectedCategory: id });
    if (announce) console.log("[Step2] Saved category:", id);
  }

  // Safety net: capture-phase click handler to defeat any remaining overlays
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest('[data-testid^="cat-"]');
      if (el) {
        const id = el.getAttribute('data-testid')!.replace('cat-','');
        selectCategory(id);
        e.stopPropagation();
      }
    };
    document.addEventListener('click', handler, true); // capture phase
    return () => document.removeEventListener('click', handler, true);
  }, [categories]);

  const cards = useMemo(() => categories.map(c => (
    <CategoryCard
      key={c.id}
      id={c.id}
      title={c.name}
      subtitle={`${c.products} products available`}
      scorePct={c.score}
      selected={selected === c.id}
      onSelect={(id) => selectCategory(id)}
    />
  )), [categories, selected]);

  return (
    <>
      {/* CSS guards to prevent overlay interference */}
      <style>{`
        /* Step 2: never let invisible layers eat clicks */
        .step2-card [data-overlay],
        .step2-overlay {
          pointer-events: none !important;
        }

        /* Make sure our full-card button stays on top in any layout */
        .step2-card button[type="button"] {
          position: absolute;
          z-index: 50;             /* above any stray overlays (z: 0–40 commonly used) */
          pointer-events: auto !important;
        }
      `}</style>
      
      <div className="container max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-900">Step 2: Choose Product Category</h2>
        <p className="mt-2 text-slate-600">Select the type of financing that best fits your business needs.</p>

        <ul className="mt-6 space-y-4 relative step2-overlay">{cards}</ul>

        <div className="mt-6 flex justify-end">
          <a
            href="/apply/step-3"
            className={`btn btn-primary ${!selected ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={!selected}
          >
            Continue
          </a>
        </div>
      </div>
    </>
  );
}

function titleize(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, m => m.toUpperCase());
}

function scoreProduct(p: any) {
  // Mirror your simple scoring (amount/country/industry) or keep it 95/90/etc.
  let s = 0;
  if (p.amountMatch) s += 40;
  if (p.countryMatch) s += 40;
  if (p.industryMatch) s += 20;
  return s || 60; // ensure something non-zero so we can rank
}