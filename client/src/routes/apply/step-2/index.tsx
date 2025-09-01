import React, { useEffect, useState } from "react";
import CategoryCard from "@/lib/recommendations/CategoryCard";
import { saveStep2 } from '@/lib/appState';

type Category = { id: string; name: string; score: number; products: number; };
const STORAGE_KEY = "bf:step2:category";

export default function Step2() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function loadCategories() {
      try {
        console.log("[Step2] Loading products...");
        const response = await fetch("/api/v1/products");
        if (!response.ok) throw new Error("Failed to load products");
        const products = await response.json();
        console.log("[Step2] Loaded", products.length, "products");
        
        // Get user's Step 1 intake for intelligent scoring
        const intake = JSON.parse(localStorage.getItem('bf:intake') || '{}');
        const amount = Number(intake.amountRequested || 0);
        const industry = String(intake.industry || '').toLowerCase();
        const country = String(intake.country || '').toLowerCase();
        
        console.log("[Step2] Scoring with profile:", { amount, industry, country });

        // Group by category
        const grouped = new Map<string, Category>();
        for (const p of products) {
          const cat = String(p.category || "").trim();
          if (!cat) continue;
          if (!grouped.has(cat)) {
            grouped.set(cat, { 
              id: cat, 
              name: titleize(cat), 
              score: 0, 
              products: 0 
            });
          }
          const g = grouped.get(cat)!;
          g.products += 1;
          
          // Smart scoring based on user profile
          let score = 40; // Base score
          
          // Amount-based scoring
          if (amount >= 100000) {
            if (cat.includes('term_loan') || cat.includes('equipment')) score += 25;
            if (cat.includes('line_of_credit')) score += 20;
          } else if (amount >= 25000) {
            if (cat.includes('working_capital') || cat.includes('line_of_credit')) score += 25;
            if (cat.includes('invoice_factoring')) score += 15;
          } else {
            if (cat.includes('working_capital') || cat.includes('short_term')) score += 20;
          }
          
          // Industry-based scoring
          if (industry.includes('construction') || industry.includes('contractor')) {
            if (cat.includes('equipment') || cat.includes('invoice_factoring')) score += 20;
          }
          if (industry.includes('retail') || industry.includes('e-commerce')) {
            if (cat.includes('inventory') || cat.includes('working_capital')) score += 20;
          }
          if (industry.includes('manufacturing')) {
            if (cat.includes('equipment') || cat.includes('term_loan')) score += 20;
          }
          
          // Product availability bonus
          if (country === 'ca' && p.country?.includes('CA')) score += 10;
          if (country === 'us' && p.country?.includes('US')) score += 10;
          
          g.score += Math.min(100, score); // Cap at 100
        }
        
        const list = [...grouped.values()]
          .map(c => ({ ...c, score: Math.round(c.score / Math.max(1, c.products)) }))
          .sort((a, b) => b.score - a.score);

        if (!mounted) return;
        setCategories(list);
        console.log("[Step2] Created", list.length, "categories");

        // Auto-select best category
        const saved = localStorage.getItem(STORAGE_KEY);
        const valid = saved && list.some(c => c.id === saved) ? saved : null;
        const pick = valid ?? (list[0]?.id ?? null);
        if (pick) {
          setSelected(pick);
          localStorage.setItem(STORAGE_KEY, pick);
          // Also save to app state for auto-selection
          const category = list.find(c => c.id === pick);
          if (category) {
            saveStep2({
              selectedCategory: pick,
              selectedCategoryName: category.name,
              selectedProductId: undefined,
              selectedProductName: undefined,
              selectedLenderName: undefined,
              matchScore: category.score
            });
          }
          console.log("[Step2] Auto-selected category:", pick);
        }
      } catch (error) {
        console.error("[Step2] Error loading products:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCategories();
    return () => { mounted = false; };
  }, []);

  function selectCategory(id: string) {
    setSelected(id);
    localStorage.setItem(STORAGE_KEY, id);
    
    // Save to shared app state for Step 5 integration
    const category = categories.find(c => c.id === id);
    if (category) {
      saveStep2({
        selectedCategory: id,
        selectedCategoryName: category.name,
        selectedProductId: undefined, // Will be set when product is selected
        selectedProductName: undefined,
        selectedLenderName: undefined,
        matchScore: category.score
      });
      console.log("[Step2] Saved category to app state:", { selectedCategory: id, selectedCategoryName: category.name });
    }
  }

  // Capture-phase click handler for ultimate overlay protection
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>("[data-step2-card]");
      if (el && el.dataset.step2Card) {
        selectCategory(el.dataset.step2Card);
        e.stopPropagation();
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-900">Step 2: Choose Product Category</h2>
        <div className="mt-6 text-slate-600">Loading categories...</div>
      </div>
    );
  }

  return (
    <>
      {/* CSS protection against overlay interference */}
      <style>{`
        .step2-card .step2-content * { pointer-events: none !important; }
        .step2-card .step2-hit { pointer-events: auto !important; }
        [data-overlay], .page-mask, .shimmer, .modal-backdrop {
          pointer-events: none !important;
        }
      `}</style>
      
      <div id="step2-root" className="container max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-slate-900">Step 2: Choose Product Category</h2>
        <p className="mt-2 text-slate-600">Select the type of financing that best fits your business needs.</p>

        <ul className="mt-6 space-y-4">
          {categories.map(c => (
            <CategoryCard
              key={c.id}
              id={c.id}
              title={c.name}
              subtitle={`${c.products} products available (Match score ${c.score}%)`}
              scorePct={c.score}
              selected={selected === c.id}
              onSelect={selectCategory}
            />
          ))}
        </ul>

        <div className="mt-6 flex justify-between">
          <a
            href="/apply/step-1"
            className="px-4 py-2 rounded-md font-medium transition bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Back
          </a>
          <a
            href="/apply/step-3"
            className={`px-4 py-2 rounded-md font-medium transition ${
              selected 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-200 text-gray-500 pointer-events-none"
            }`}
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