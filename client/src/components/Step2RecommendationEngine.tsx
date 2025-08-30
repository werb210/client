import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Loader2 } from 'lucide-react';
import { useFormDataContext } from "@/context/FormDataContext";
import { fetchProducts } from "@/api/products";

type Props = {
  formData?: any;
  intake?: any;
  selectedProduct?: string;
  onProductSelect?: (product: string) => void;
  onContinue?: () => void;
  onPrevious?: () => void;
};

export default function Step2RecommendationEngine(props: Props) {
  const { state } = useFormDataContext();
  const [products, setProducts] = useState<any[] | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  // Check if Step 1 data exists
  const step1Data = state?.step1 || {};
  const hasStep1Data = step1Data.fundingAmount && step1Data.fundingAmount > 0;

  useEffect(() => {
    if (!hasStep1Data) {
      setReason("Missing Step 1 data (funding amount required)");
      return;
    }
    fetchProducts()
      .then((p) => setProducts(p))
      .catch((e) => setReason(`Failed to load products: ${e}`));
  }, [hasStep1Data]);

  // expose quick debug in dev
  (window as any).__step2 = { 
    step1Data, 
    hasStep1Data, 
    productsCount: products?.length, 
    reason,
    fullState: state 
  };

  if (!hasStep1Data || !products) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-lg border p-4">
          <div className="font-medium">Product Matching Pending</div>
          <div className="text-sm text-muted-foreground">
            {reason ?? "Loading…"}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Debug: hasStep1Data={String(hasStep1Data)}, products={products?.length ?? 'null'}, reason={reason}
            <br/>Step1: fundingAmount={step1Data.fundingAmount || 'missing'}
          </div>
        </div>
      </div>
    );
  }

  // Simple filtering for eligible products
  const eligibleProducts = products.filter((p: any) => {
    const requestedAmount = step1Data?.fundingAmount || 0;
    const matchesAmount = requestedAmount === 0 || 
                         (requestedAmount >= (p.min_amount || 0) && 
                          requestedAmount <= (p.max_amount || Number.MAX_SAFE_INTEGER));
    const isActive = p.active !== false;
    return matchesAmount && isActive;
  });

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-teal-600" />
          <CardTitle>Recommended Loan Products</CardTitle>
        </div>
        <CardDescription>
          Found {eligibleProducts.length} matching products for ${(step1Data?.fundingAmount || 0).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {eligibleProducts.slice(0, 5).map((product: any) => (
            <div key={product.id} className="rounded-xl border p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-lg">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.lender_name}</div>
                  <div className="text-sm text-gray-500">{product.category}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    ${(product.min_amount || 0).toLocaleString()} - ${(product.max_amount || 999999999).toLocaleString()}
                  </div>
                </div>
                <Button 
                  onClick={() => props.onProductSelect?.(product.id)}
                  className="bg-[#FF8C00] hover:bg-[#E07B00]"
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-6">
          <Button onClick={props.onPrevious} variant="outline">
            Previous Step
          </Button>
          <Button onClick={props.onContinue} className="bg-[#FF8C00] hover:bg-[#E07B00]">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { Step2RecommendationEngine };