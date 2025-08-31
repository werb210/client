import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from "../api/products";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight } from 'lucide-react';
import CategoryPicker from '@/components/CategoryPicker';

const requireIntake = () => {
  // Try multiple storage keys to find Step 1 data
  const sessionData = sessionStorage.getItem('bf:intake');
  const localData = localStorage.getItem('bf:intake');
  const applyFormData = localStorage.getItem('apply.form');
  
  const s = sessionData || localData || applyFormData;
  if (!s) {
    return null;
  }
  
  try {
    const parsed = JSON.parse(s);
    return parsed;
  } catch (e) {
    console.error('🚨 [requireIntake] JSON parse error:', e);
    return null;
  }
};

const failSafeNumber = (n:any) => (typeof n === 'number' && !Number.isNaN(n)) ? n : 0;

function Pending({msg}:{msg:string}) {
  return <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">{msg}</div>;
}

type Props = {
  formData?: any;
  selectedProduct?: string;
  onProductSelect?: (productId: string) => void;
  onContinue?: () => void;
  onPrevious?: () => void;
};

export function Step2RecommendationEngine(props: Props){
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    (async ()=>{
      try{
        const products = await import('../api/products').then(m => m.fetchProducts());
        setAllProducts(Array.isArray(products) ? products : []);
        // Initial filter with form data
        const { getRecommendedProducts } = await import('../lib/recommendations/engine');
        const formData = requireIntake();
        const data = getRecommendedProducts(formData, products);
        setFilteredProducts(Array.isArray(data) ? data : []);
      }catch(e:any){
        setError(e?.message || 'fetch_failed');
      }finally{
        setLoading(false);
      }
    })();
  }, []);

  const handleCategoryChange = async (categories: string[]) => {
    try {
      const { getRecommendedProducts } = await import('../lib/recommendations/engine');
      const formData = requireIntake();
      const data = getRecommendedProducts(formData, allProducts, { categories });
      setFilteredProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Category filter error:', e);
    }
  };

  const intake = requireIntake();

  // Early diagnostics into window with detailed storage info
  (window as any).__step2 = { 
    ...(window as any).__step2, 
    loading, 
    error, 
    intake, 
    productsCount: products.length,
    // Debug storage directly
    sessionStorage: {
      'bf:intake': sessionStorage.getItem('bf:intake'),
      'bf:intake:v2': sessionStorage.getItem('bf:intake:v2')
    },
    localStorage: {
      'bf:intake': localStorage.getItem('bf:intake'),
      'apply.form': localStorage.getItem('apply.form')
    }
  };


  if (!intake) {
    return <Pending msg="Missing Step 1 data. Please complete Step 1 first." />;
  }

  // Normalize once
  const amount = failSafeNumber(intake.amountRequested);
  const country = intake.country;

  // Update debug info
  (window as any).__step2 = { 
    ...(window as any).__step2, 
    loading, 
    error, 
    intake, 
    allProductsCount: allProducts.length,
    filteredCount: filteredProducts.length,
    // Debug storage directly
    sessionStorage: {
      'bf:intake': sessionStorage.getItem('bf:intake'),
      'bf:intake:v2': sessionStorage.getItem('bf:intake:v2')
    },
    localStorage: {
      'bf:intake': localStorage.getItem('bf:intake'),
      'apply.form': localStorage.getItem('apply.form'),
      'bf:step2:categories': localStorage.getItem('bf:step2:categories')
    }
  };

  if (loading) return <Pending msg="Loading live products…" />;
  if (error)   return <Pending msg={`Products error: ${error} | Debug: Check console for window.__step2`} />;

  return (
    <div>
      <CategoryPicker products={allProducts} onChange={handleCategoryChange} />
      
      {!filteredProducts.length ? (
        <Pending msg={`No products match your filters. Found ${allProducts.length} total products. Try selecting different categories above.`} />
      ) : (
        <ProductList products={filteredProducts} intake={intake} onProductSelect={props.onProductSelect} onContinue={props.onContinue} />
      )}
    </div>
  );
}

export default Step2RecommendationEngine;

function ProductList({ products, intake, onProductSelect, onContinue }: { 
  products: any[], 
  intake: any, 
  onProductSelect?: (productId: string) => void,
  onContinue?: () => void 
}) {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-teal-600" />
          <CardTitle>Recommended Loan Products</CardTitle>
        </div>
        <CardDescription>
          Found {products.length} matching products for ${intake.amountRequested?.toLocaleString() || 'N/A'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.slice(0, 5).map((product: any) => (
            <div key={product.id} className="rounded-xl border p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-lg">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.lender_name || product.lender}</div>
                  <div className="text-sm text-gray-500">{product.category}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    ${((product.min_amount || product.minAmount) || 0).toLocaleString()} - ${((product.max_amount || product.maxAmount) || 999999999).toLocaleString()}
                  </div>
                </div>
                <Button 
                  onClick={() => onProductSelect?.(product.id)}
                  className="bg-[#FF8C00] hover:bg-[#E07B00]"
                >
                  Select
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {onContinue && (
          <div className="mt-6 flex justify-center">
            <Button onClick={onContinue} className="bg-teal-600 hover:bg-teal-700">
              Continue to Next Step
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}