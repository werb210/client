import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLenderCategories } from "../api/lenders";
import { useLenders } from "../store/lenders";
import { useApplication } from "../store/application";

export default function Step2() {
  const nav = useNavigate();
  const { categories, setCategories } = useLenders();
  const { setStep1 } = useApplication();

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetchLenderCategories();
      setCategories(response.categories);
      setLoading(false);
    }
    load();
  }, [setCategories]);

  function continueNext() {
    if (!selected) return;
    // Save category to the application zustand store
    setStep1((prev: any) => ({ ...prev, productCategory: selected }));
    nav("/step-3");
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-lg">
        Loading lender products...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Step 2 — Choose a Product Category</h1>
      <p className="text-gray-600">
        Based on your business and financial details, choose the product
        category you want to apply for.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelected(cat.name)}
            className={`border p-4 rounded text-left ${
              selected === cat.name ? "border-blue-600 bg-blue-50" : "border-gray-300"
            }`}
          >
            <div className="text-lg font-medium">{cat.name}</div>
            <div className="text-sm text-gray-600">{cat.description}</div>
          </button>
        ))}
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mt-6 disabled:opacity-40"
        disabled={!selected}
        onClick={continueNext}
      >
        Continue to Step 3
      </button>
    </div>
  );
}
