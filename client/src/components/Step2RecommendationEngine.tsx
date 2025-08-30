import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '@/api/products';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight } from 'lucide-react';

const requireIntake = () => {
  const sessionData = sessionStorage.getItem('bf:intake');
  const localData = localStorage.getItem('bf:intake');
  console.log('🔍 [requireIntake] Raw storage data:', { sessionData, localData });
  
  const s = sessionData || localData;
  if (!s) {
    console.warn('🚨 [requireIntake] No storage data found');
    return null;
  }
  
  try {
    const parsed = JSON.parse(s);
    console.log('🔍 [requireIntake] Parsed intake:', parsed);
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
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    (async ()=>{
      try{
        const data = await fetchProducts();
        setProducts(Array.isArray(data) ? data : []);
      }catch(e:any){
        setError(e?.message || 'fetch_failed');
      }finally{
        setLoading(false);
      }
    })();
  }, []);

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

  // Detailed console logging for debugging
  console.log('🔍 [STEP2] Storage debug:', {
    sessionIntake: sessionStorage.getItem('bf:intake'),
    localIntake: localStorage.getItem('bf:intake'),
    parsedIntake: intake,
    productsLoaded: products.length
  });

  if (!intake) {
    console.warn('🚨 [STEP2] No intake data found in storage!');
    return <Pending msg="Missing Step 1 data. Please complete Step 1 first." />;
  }

  // Normalize once
  const amount = failSafeNumber(intake.amountRequested);
  const country = intake.country;

  // Minimal eligibility to avoid "all filtered out" when strings slip through
  const eligible = useMemo(()=>{
    const list = products.filter(p=>{
      // accept broad country matches; treat undefined as global
      const okCountry = !p.country || p.country === country;
      // robust numeric comparisons
      const min = failSafeNumber(p.min_amount || p.minAmount);
      const max = failSafeNumber(p.max_amount || p.maxAmount);
      const okAmount = (!min || amount >= min) && (!max || amount <= max || max === 0);
      const isActive = p.active !== false && p.isActive !== false;
      return okCountry && okAmount && isActive;
    });
    (window as any).__step2 = { ...(window as any).__step2, eligibleCount: list.length, lastFilter: { amount, country } };
    return list;
  }, [products, amount, country]);

  if (loading) return <Pending msg="Loading live products…" />;
  if (error)   return <Pending msg={`Products error: ${error} | Debug: Check console for window.__step2`} />;

  // Debug the filtering issue
  console.log('🔍 [STEP2] Product filtering debug:', {
    totalProducts: products.length,
    eligibleProducts: eligible.length,
    intake: { amount, country },
    firstProduct: products[0] ? {
      name: products[0].name,
      country: products[0].country,
      min_amount: products[0].min_amount,
      max_amount: products[0].max_amount,
      active: products[0].active
    } : null
  });

  if (!eligible.length) {
    return <Pending msg={`No eligible products after filters. Found ${products.length} total products but 0 eligible. Check console for filtering details.`} />;
  }

  return <ProductList products={eligible} intake={intake} onProductSelect={props.onProductSelect} onContinue={props.onContinue} />; // your real renderer
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