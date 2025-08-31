import React, { useEffect, useMemo, useState } from "react";
import CategoryCard from "@/lib/recommendations/CategoryCard";
import { useFormData } from "@/context/FormDataContext";

type Category = { id: string; name: string; score: number; products: number; subtitle?: string; };
const STORAGE_KEY = "bf:step2:category";

export default function Step2() {
  const { save } = useFormData();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let done = false;
    (async () => {
      try {
        const response = await fetch("/api/v1/products");
        if (!response.ok) throw new Error("Failed to load products");
        const products = await response.json();                    // 42 items expected
        const grouped = new Map<string, Category>();
        for (const p of products) {
          const cat = String(p.category || "").trim();
          if (!cat) continue;
          if (!grouped.has(cat)) grouped.set(cat, { id: cat, name: titleize(cat), score: 0, products: 0 });
          const g = grouped.get(cat)!;
          g.products += 1;
          g.score += scoreProduct(p);
        }
        const list = [...grouped.values()]
          .map(c => ({ ...c, score: Math.round(c.score / Math.max(1, c.products)) }))
          .sort((a, b) => b.score - a.score);

        if (done) return;
        setCategories(list);

        const saved = localStorage.getItem(STORAGE_KEY);
        const valid = saved && list.some(c => c.id === saved) ? saved : null;
        const pick = valid ?? (list[0]?.id ?? null);
        if (pick) applySelection(pick, list, false);
      } catch (error) {
        console.error("[Step2] Failed to load products:", error);
      }
    })();
    return () => { done = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applySelection(id: string, list = categories, log = true) {
    setSelected(id);
    localStorage.setItem(STORAGE_KEY, id);
    save({ selectedCategory: id });               // what Step 3 reads
    if (log) console.log("[Step2] Saved category:", id);
  }

  // ULTRA-DEFENSIVE: capture-phase click delegation (wins over overlays)
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>("[data-step2-card]");
      if (!el) return;
      const id = el.dataset.step2Card!;
      applySelection(id, categories);
      e.stopPropagation();
    };
    document.addEventListener("click", h, true);
    return () => document.removeEventListener("click", h, true);
  }, [categories]);

  const cards = useMemo(() =>
    categories.map(c => (
      <CategoryCard
        key={c.id}
        id={c.id}
        title={c.name}
        subtitle={`${c.products} products available (Match score ${c.score}%)`}
        scorePct={c.score}
        selected={selected === c.id}
        onSelect={(id) => applySelection(id)}
      />
    )), [categories, selected]);

  return (
    <>
      {/* CSS guards to prevent overlay interference */}
      <style>{`
        /* Step 2: never let invisible layers eat clicks */
        .step2-card .step2-content * { pointer-events: none !important; }
        .step2-card .step2-hit { pointer-events: auto !important; }

        /* Catch any explicit "overlay" elements if they exist */
        [data-overlay], .page-mask, .shimmer, .modal-backdrop {
          pointer-events: none !important;
        }
      `}</style>
      
      <div id="step2-root" className="container max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-900">Step 2: Choose Product Category</h2>
        <p className="mt-2 text-slate-600">Select the type of financing that best fits your business needs.</p>

        <ul className="mt-6 space-y-4">{cards}</ul>

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

function titleize(s: string) { return s.replace(/_/g, " ").replace(/\b\w/g, m => m.toUpperCase()); }
function scoreProduct(p: any) {
  let s = 0;
  if (p.amountMatch) s += 40;
  if (p.countryMatch) s += 40;
  if (p.industryMatch) s += 20;
  return s || 60;
}