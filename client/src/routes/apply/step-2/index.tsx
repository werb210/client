import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

// --- Config keys shared with Step 3 ---
const LS_KEY = "bf:step2:category";

// --- Types (adapt to your shape if needed) ---
type Product = {
  id: string;
  name: string;
  category: string;            // "line_of_credit" | "term_loan" | ...
  country?: string;
  minAmount?: number;
  maxAmount?: number;
  matchScore?: number;         // 0..100, optional; we'll fallback if absent
};

type CategoryBucket = {
  id: string;                  // same as product.category
  label: string;               // user-facing, e.g. "Line of Credit"
  products: Product[];
  // aggregated score (max of products in bucket by default)
  score: number;
  // text bullets for card (match/regional copy)
  bullets: string[];
};

// --- Utilities you already have (replace imports if they exist) ---
async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/v1/products");
  if (!res.ok) throw new Error("Failed to load products");
  return await res.json();
}

// Map category code -> nice label (extend here as you add more)
const CATEGORY_LABELS: Record<string, string> = {
  line_of_credit: "Line of Credit",
  term_loan: "Term Loan",
  invoice_factoring: "Invoice Factoring", 
  equipment_financing: "Equipment Financing",
  purchase_order_financing: "Purchase Order Financing",
  working_capital: "Working Capital",
};

// Build category buckets + compute a bucket score = max(matchScore) within bucket
function groupByCategory(products: Product[]): CategoryBucket[] {
  const map = new Map<string, CategoryBucket>();
  for (const p of products) {
    const id = p.category;
    if (!id) continue;
    const label = CATEGORY_LABELS[id] ?? id.replace(/_/g, " ");
    if (!map.has(id)) {
      map.set(id, { id, label, products: [], score: 0, bullets: [] });
    }
    const bucket = map.get(id)!;
    bucket.products.push(p);
    const s = typeof p.matchScore === "number" ? p.matchScore : 0;
    if (s > bucket.score) bucket.score = s;
  }

  // Build bullets (simple, readable copy; tweak as needed)
  for (const b of map.values()) {
    const count = b.products.length;
    const maxScore = Math.round(b.score);
    b.bullets = [
      `${count} product${count === 1 ? "" : "s"} available`,
      `Match score: ${maxScore}%`,
      `Matches your funding requirement`, // keep wording from your screenshots
      `Available in your region (CA)`,    // adjust based on user profile if needed
    ];
  }

  // Sort by score DESC, then by label ASC to stabilize order
  return Array.from(map.values()).sort(
    (a, b) => b.score - a.score || a.label.localeCompare(b.label)
  );
}

// Guard overlays inside Step 2 only (prevents invisible layers stealing clicks)
const OverlayGuards: React.FC = () => (
  <style>{`
    /* Scope to Step 2 page root */
    .step2-scope [data-overlay],
    .step2-scope .modal-backdrop,
    .step2-scope .vite-dev-overlay,
    .step2-scope .dev-ui-overlay,
    .step2-scope .preview-topbar,
    .step2-scope .preview-surface-blocker,
    .step2-scope .app-overlay,
    .step2-scope .shim-overlay,
    .step2-scope .screen-blocker {
      pointer-events: none !important;
    }
    .step2-scope .CategoryCard button {
      position: relative;
      z-index: 2;
      pointer-events: auto !important;
    }
    /* Ensure cards themselves sit above any accidental siblings */
    .step2-scope .CategoryCard { position: relative; z-index: 2; }
  `}</style>
);

// Accessible, focusable, truly clickable category card
const CategoryCard: React.FC<{
  bucket: CategoryBucket;
  selected: boolean;
  onSelect: (id: string) => void;
}> = ({ bucket, selected, onSelect }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(bucket.id);
  };
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(bucket.id);
    }
  };

  return (
    <div
      className={clsx(
        "CategoryCard",
        "rounded-xl border mb-4",
        selected ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"
      )}
      style={{ overflow: "hidden" }}
    >
      <div className="flex items-start gap-3 p-5">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-slate-800">
              {bucket.label}
            </h3>
            {selected && (
              <span className="inline-flex items-center text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                Selected
              </span>
            )}
          </div>
          <ul className="mt-2 text-sm text-slate-600 list-disc pl-5">
            {bucket.bullets.slice(0, 3).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>

        <div className="pt-1">
          <button
            type="button"
            data-testid={`cat-${bucket.id}`}
            aria-pressed={selected}
            aria-label={`Select ${bucket.label}`}
            onClick={handleClick}
            onKeyDown={handleKey}
            className={clsx(
              "rounded-md border px-3 py-1.5 text-sm",
              selected
                ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                : "border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100"
            )}
          >
            {selected ? "Selected" : "Select"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Step2: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [buckets, setBuckets] = useState<CategoryBucket[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load products
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await fetchProducts();
        if (!mounted) return;
        setProducts(p);
        const grouped = groupByCategory(p);
        setBuckets(grouped);

        // Always choose the BEST bucket on load.
        // If a saved value exists but isn't the current best, override it with the best.
        const saved = localStorage.getItem(LS_KEY) || null;
        const best = grouped[0]?.id ?? null;
        const initial = best ?? saved;
        if (initial) {
          setSelected(initial);
          localStorage.setItem(LS_KEY, initial);
        }
      } catch (e) {
        console.error("[STEP2] Failed to load products", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSelect = (id: string) => {
    setSelected(id);
    localStorage.setItem(LS_KEY, id);
    // If you have an apply context, sync it here (safe no-op if unavailable)
    try {
      // @ts-ignore
      window.__applyCtx?.set?.({ productCategory: id });
    } catch {}
    console.log("[Step2] Saved category:", id);
  };

  const canContinue = !!selected;

  const onContinue = () => {
    if (!selected) return;
    window.location.assign("/apply/step-3");
  };

  return (
    <div className="step2-scope" data-testid="step2-root" style={{position:'relative', isolation:'isolate', zIndex:1}}>
      <OverlayGuards />
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-slate-800 mt-6">
          Step 2: Choose Product Category
        </h2>
        <p className="text-center text-slate-600 mt-2 mb-6">
          Select the type of financing that best fits your business needs
        </p>

        {loading && <div className="text-slate-500">Loading products…</div>}

        {!loading && buckets.length === 0 && (
          <div className="text-slate-500">No categories available.</div>
        )}

        {!loading &&
          buckets.map((b) => (
            <CategoryCard
              key={b.id}
              bucket={b}
              selected={selected === b.id}
              onSelect={onSelect}
            />
          ))}

        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => window.location.assign("/apply/step-1")}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!canContinue}
            className={clsx(
              "rounded-md px-4 py-2 text-sm font-medium",
              canContinue
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            )}
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2;
