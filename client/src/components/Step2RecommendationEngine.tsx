import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Loader2 } from 'lucide-react';
import { useFormData } from "@/context/FormDataContext";
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
  const { data, isComplete } = useFormData();
  const [products, setProducts] = useState<any[] | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (!isComplete) {
      setReason("Missing or unnormalized Step-1 values (amount, etc.)");
      return;
    }
    fetchProducts()
      .then((p) => setProducts(p))
      .catch((e) => setReason(`Failed to load products: ${e}`));
  }, [isComplete]);

  // expose quick debug in dev
  (window as any).__step2 = { data, isComplete, productsCount: products?.length, reason };

  if (!isComplete || !products) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-lg border p-4">
          <div className="font-medium">Product Matching Pending</div>
          <div className="text-sm text-muted-foreground">
            {reason ?? "Loading…"}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Debug: isComplete={String(isComplete)}, products={products?.length ?? 'null'}, reason={reason}
          </div>
        </div>
      </div>
    );
  }

  // Simple filtering for eligible products
  const eligibleProducts = products.filter((p: any) => {
    const matchesAmount = !data?.requestedAmount || !data?.fundingAmount || 
                         ((data?.requestedAmount || 0) >= (p.minAmount || 0) && 
                          (data?.requestedAmount || 0) <= (p.maxAmount || Number.MAX_SAFE_INTEGER));
    const isActive = p.isActive !== false;
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
          Found {eligibleProducts.length} matching products for ${(data?.requestedAmount || data?.fundingAmount || 0).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {eligibleProducts.slice(0, 5).map((product: any) => (
            <div key={product.id} className="rounded-xl border p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-lg">{product.productName || product.name}</div>
                  <div className="text-sm text-gray-600">{product.lender || product.lender_name}</div>
                  <div className="text-sm text-gray-500">{product.category}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    ${(product.minAmount || 0).toLocaleString()} - ${(product.maxAmount || 999999999).toLocaleString()}
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