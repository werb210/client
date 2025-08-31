import React, { useEffect, useState } from "react";
import CategoryPicker from "../../../components/CategoryPicker";
import type { Product } from "../../../lib/categories";

const PRODUCTS_URL = "/api/v1/products";
const LS_FORM = "bf:intake";

export default function Step2() {
  const [products, setProducts] = useState<Product[]>([]);
  const [answers, setAnswers] = useState<any>({});

  useEffect(() => {
    // Step 1 answers come from context or localStorage (fallback)
    try {
      const raw = window.localStorage.getItem(LS_FORM);
      if (raw) setAnswers(JSON.parse(raw));
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

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Step 2: Product Recommendations</h1>

      <section className="rounded-2xl border p-4 mb-4">
        <h2 className="font-semibold mb-2">Your Profile Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
          <div><div className="text-gray-500">Headquarters:</div>{answers.country || "—"}</div>
          <div><div className="text-gray-500">Funding Amount:</div>${answers.amountRequested ?? answers.loanAmount ?? "—"}</div>
          <div><div className="text-gray-500">Looking For:</div>{answers.lookingFor || "—"}</div>
          <div><div className="text-gray-500">Industry:</div>{answers.industry || "—"}</div>
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Select Your Preferred Loan Product</h2>
        <CategoryPicker products={products} answers={answers} />
      </section>
    </main>
  );
}
