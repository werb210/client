import React, { useCallback, useEffect, useMemo, useState } from "react";
import CategoryPicker from "../../../components/CategoryPicker";
import type { Product } from "../../../lib/categories";

const PRODUCTS_URL = "/api/v1/products";
const LS_FORM = "bf:intake";
const LS_CATEGORY = "bf:step2:category";

export default function Step2() {
  const [products, setProducts] = useState<Product[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS_FORM);
      if (raw) setAnswers(JSON.parse(raw));
      
      const savedCategory = localStorage.getItem(LS_CATEGORY);
      if (savedCategory) setSelectedCategory(JSON.parse(savedCategory));
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(PRODUCTS_URL);
        if (r.ok) {
          const json = await r.json();
          setProducts(Array.isArray(json.items) ? json.items : json);
        }
      } catch {}
    })();
  }, []);

  const handleCategorySelect = useCallback((category: any) => {
    const categoryString = String(category);
    setSelectedCategory(categoryString);
    try { 
      localStorage.setItem(LS_CATEGORY, JSON.stringify(categoryString)); 
      // Also update the main form data
      const currentAnswers = { ...answers, selectedCategory: categoryString };
      localStorage.setItem(LS_FORM, JSON.stringify(currentAnswers));
      setAnswers(currentAnswers);
    } catch {}
  }, [answers]);

  const canContinue = useMemo(() => Boolean(selectedCategory), [selectedCategory]);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-primary">Step 2: Product Recommendations</h1>

      <section className="panel-success mb-4">
        <h2 className="font-semibold mb-2">Your Profile Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
          <div><div className="text-gray-500">Headquarters:</div>{answers.country || "—"}</div>
          <div><div className="text-gray-500">Funding Amount:</div>${answers.amountRequested ?? answers.loanAmount ?? "—"}</div>
          <div><div className="text-gray-500">Looking For:</div>{answers.lookingFor || "—"}</div>
          <div><div className="text-gray-500">Industry:</div>{answers.industry || "—"}</div>
        </div>
      </section>

      <section className="panel-warn">
        <h2 className="font-semibold mb-2">Select Your Preferred Loan Product</h2>
        <CategoryPicker 
          products={products} 
          answers={answers}
          onPicked={handleCategorySelect}
        />
      </section>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.location.href = '/apply/step-1'}
        >
          Previous
        </button>
        <button
          type="button"
          className={["btn", canContinue ? "btn-primary" : "btn-disabled"].join(' ')}
          disabled={!canContinue}
          onClick={() => { if (canContinue) window.location.href = '/apply/step-3'; }}
        >
          Continue
        </button>
      </div>
    </main>
  );
}
