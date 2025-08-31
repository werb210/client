import React, { useEffect, useState } from "react";
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { StepHeader } from '@/components/StepHeader';
import CategoryCards from '@/components/Step2/CategoryCards';
import { Button } from '@/components/ui/button';
import type { Product } from '@/api/products';

const PRODUCTS_URL = "/api/v1/products";

export default function Step2Recommendations() {
  const { data: contextData } = useFormData();
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);

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

  const handleContinue = () => {
    setLocation('/apply/step-3');
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
            onSelect={(category, products) => {
              console.log('Selected category:', category, 'with', products.length, 'products');
            }} 
          />
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack}>
              Previous
            </Button>
            <Button onClick={handleContinue}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
