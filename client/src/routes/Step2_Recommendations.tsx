import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { StepHeader } from '@/components/StepHeader';
import CategoryCards from '@/components/Step2/CategoryCards';
import { Button } from '@/components/ui/button';
import type { Product } from '@/api/products';

const PRODUCTS_URL = "/api/v1/products";
const LS_CATEGORY = "bf:step2:category";

export default function Step2Recommendations() {
  const { data: contextData, save } = useFormData();
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCategory = localStorage.getItem(LS_CATEGORY);
      if (savedCategory) setSelectedCategory(savedCategory);
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

  const handleCategorySelect = useCallback((category: string, products: Product[]) => {
    setSelectedCategory(category);
    try { 
      localStorage.setItem(LS_CATEGORY, category); 
      // Update form context with selected category
      save({ selectedCategory: category });
    } catch {}
  }, [save]);

  const canContinue = useMemo(() => Boolean(selectedCategory), [selectedCategory]);

  const handleContinue = () => {
    if (canContinue) {
      setLocation('/apply/step-3');
    }
  };

  const handleBack = () => {
    setLocation('/apply/step-1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <StepHeader
          stepNumber={2}
          totalSteps={7}
          title="Choose Product Category"
          description="Select the type of financing that best fits your business needs"
        />

        <div className="max-w-4xl mx-auto mt-8">
          <CategoryCards 
            intake={contextData || {}} 
            onSelect={handleCategorySelect}
          />
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack}>
              Previous
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!canContinue}
              className={!canContinue ? "opacity-50 cursor-not-allowed" : ""}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
