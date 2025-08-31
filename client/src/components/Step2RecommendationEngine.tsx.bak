import { useEffect, useState } from 'react';
import { getProducts, loadSelectedCategories } from "../api/products";
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
        const products = await getProducts({ useCacheFirst: true });
        setAllProducts(Array.isArray(products) ? products : []);
        setFilteredProducts(Array.isArray(products) ? products : []);
      }catch(e:any){
        setError(e?.message || 'fetch_failed');
      }finally{
        setLoading(false);
      }
    })();
  }, []);

  const handleCategoryChange = (categories: string[]) => {
    if (!categories.length) {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(p => p.category && categories.includes(p.category));
      setFilteredProducts(filtered);
    }
  };

  const intake = requireIntake();

  // Update debug info
  (window as any).__step2 = { 
    loading, 
    error, 
    intake, 
    allProductsCount: allProducts.length,
    filteredCount: filteredProducts.length,
    localStorage: {
      'bf:intake': localStorage.getItem('bf:intake'),
      'apply.form': localStorage.getItem('apply.form'),
      'bf:step2:categories': localStorage.getItem('bf:step2:categories')
    }
  };

  if (loading) return <Pending msg="Loading live products…" />;
  if (error)   return <Pending msg={`Products error: ${error} | Debug: Check console for window.__step2`} />;

  if (!intake) {
    return <Pending msg="Missing Step 1 data. Please complete Step 1 first." />;
  }

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
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const handleSelect = (productId: string) => {
    setSelectedProduct(productId);
    onProductSelect?.(productId);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Found {products.length} eligible products
      </div>
      
      {products.map((product, index) => (
        <Card
          key={product.id || index}
          className={`cursor-pointer transition-all ${
            selectedProduct === product.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleSelect(product.id || '')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {product.name || product.productName || 'Unnamed Product'}
            </CardTitle>
            <CardDescription>
              {product.category} • {product.lender_name || product.lenderName || 'Unknown Lender'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p><strong>Amount Range:</strong> ${product.minAmount?.toLocaleString()} - ${product.maxAmount?.toLocaleString()}</p>
              <p><strong>Country:</strong> {product.country}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {selectedProduct && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={props.onPrevious}>
            Previous
          </Button>
          <Button onClick={onContinue} className="flex items-center gap-2">
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}