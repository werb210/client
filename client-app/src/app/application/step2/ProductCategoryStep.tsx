"use client";

import { useEffect, useState } from "react";
import { fetchProductCategories } from "@/lib/api/products";
import { useApplicationStore } from "@/state/application";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductCategoryStep() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { selectedProductCategory, setSelectedProductCategory, goToNext } =
    useApplicationStore();

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchProductCategories();
        setCategories(list);
      } catch (err) {
        console.error(err);
        setError("Unable to load lender products.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-10 text-lg">
        Loading product categories…
      </div>
    );

  if (error)
    return (
      <div className="text-red-600 text-center py-8 font-medium">{error}</div>
    );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Select a Product Type</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            className={`cursor-pointer border-2 transition ${
              selectedProductCategory === cat.id
                ? "border-blue-600 shadow-lg"
                : "border-gray-200 hover:border-gray-400"
            }`}
            onClick={() => setSelectedProductCategory(cat.id)}
          >
            <CardHeader>
              <CardTitle className="text-xl">{cat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">{cat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          disabled={!selectedProductCategory}
          onClick={goToNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
