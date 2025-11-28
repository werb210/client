import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProductCategories } from "../../api/products";
import { useProducts } from "../../state/products";
import { useAuthContext } from "../../context/AuthContext";

export default function Step2() {
  const nav = useNavigate();
  const { token } = useAuthContext();
  const { categories, setCategories } = useProducts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!categories) {
        const { data } = await fetchProductCategories();
        setCategories(data.categories);
      }
      setLoading(false);
    }
    load();
  }, [categories, setCategories]);

  useEffect(() => {
    if (!token) {
      nav("/");
    }
  }, [nav, token]);

  if (!token) return null;

  if (loading) return <div className="p-6">Loading products…</div>;

  function selectCategory(catId: string) {
    localStorage.setItem("app_selected_category", catId);
    nav("/apply/step-3");
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Select the type of funding you need
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories?.map((cat) => (
          <div
            key={cat.id}
            onClick={() => selectCategory(cat.id)}
            className="border rounded-lg p-5 shadow hover:shadow-lg cursor-pointer transition"
          >
            <div className="text-xl font-semibold">{cat.name}</div>
            <p className="text-gray-600 mt-2">{cat.description}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => nav("/apply/step-1")}
        className="mt-8 text-blue-600 underline"
      >
        Back
      </button>
    </div>
  );
}
