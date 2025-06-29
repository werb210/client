import { useMemo } from 'react';
import { usePublicLenders, type LenderProduct } from '@/hooks/usePublicLenders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Globe, Building2, DollarSign, Clock, Users } from 'lucide-react';

interface ProductsByCountry {
  [country: string]: {
    [category: string]: LenderProduct[];
  };
}

function ProductCard({ product }: { product: LenderProduct }) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{product.productType}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {product.lenderName}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            ID: {product.id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
          {product.description}
        </p>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Amount Range</p>
              <p className="text-sm font-medium">
                ${product.minAmount?.toLocaleString() || 'N/A'} - ${product.maxAmount?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Interest Rate</p>
              <p className="text-sm font-medium">{product.interestRate}%</p>
            </div>
          </div>
          
          {product.processingTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-500">Processing Time</p>
                <p className="text-sm font-medium">{product.processingTime}</p>
              </div>
            </div>
          )}
          
          {product.country && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Country</p>
                <p className="text-sm font-medium">{product.country}</p>
              </div>
            </div>
          )}
        </div>

        {product.industry && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Target Industry</p>
            <Badge variant="secondary" className="text-xs">
              {product.industry}
            </Badge>
          </div>
        )}

        {product.qualifications && product.qualifications.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Qualifications</p>
            <div className="flex flex-wrap gap-1">
              {product.qualifications.map((qual, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {qual}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CountrySection({ country, categories }: { country: string; categories: { [category: string]: LenderProduct[] } }) {
  const totalProducts = Object.values(categories).reduce((sum, products) => sum + products.length, 0);
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {country || 'Global/Unspecified'}
        </h2>
        <Badge variant="secondary" className="ml-auto">
          {totalProducts} products
        </Badge>
      </div>
      
      <Tabs defaultValue={Object.keys(categories)[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
          {Object.entries(categories).map(([category, products]) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="text-xs sm:text-sm"
            >
              {category} ({products.length})
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.entries(categories).map(([category, products]) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {category} Products
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {products.length} product{products.length !== 1 ? 's' : ''} available in this category
              </p>
            </div>
            
            <div className="grid gap-4 lg:grid-cols-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export function LenderProductsList() {
  const { data: products, isLoading, error } = usePublicLenders();

  const organizedProducts = useMemo(() => {
    if (!products) return {};

    const organized: ProductsByCountry = {};

    products.forEach(product => {
      const country = product.country || 'Global';
      const category = product.productType || 'General Financing';

      if (!organized[country]) {
        organized[country] = {};
      }
      if (!organized[country][category]) {
        organized[country][category] = [];
      }
      
      organized[country][category].push(product);
    });

    // Sort products within each category by interest rate
    Object.keys(organized).forEach(country => {
      Object.keys(organized[country]).forEach(category => {
        organized[country][category].sort((a, b) => 
          (a.interestRate || 999) - (b.interestRate || 999)
        );
      });
    });

    return organized;
  }, [products]);

  const stats = useMemo(() => {
    if (!products) return { total: 0, countries: 0, categories: 0 };

    const countries = new Set(products.map(p => p.country || 'Global'));
    const categories = new Set(products.map(p => p.productType || 'General Financing'));

    return {
      total: products.length,
      countries: countries.size,
      categories: categories.size
    };
  }, [products]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Unable to load lender products
          </h3>
          <p className="text-red-600 mb-4">
            {error.message}
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 className="font-semibold text-red-800 mb-2">Troubleshooting:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Check staff backend CORS configuration</li>
              <li>• Verify API endpoint is accessible</li>
              <li>• Ensure lender products database has data</li>
              <li>• Check network connectivity</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No lender products found
          </h3>
          <p className="text-gray-600">
            The lender products database appears to be empty.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
            </div>
            <p className="text-sm text-gray-600">Total Products</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.countries}</span>
            </div>
            <p className="text-sm text-gray-600">Countries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{stats.categories}</span>
            </div>
            <p className="text-sm text-gray-600">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Products by Country and Category */}
      {Object.entries(organizedProducts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([country, categories]) => (
          <CountrySection 
            key={country} 
            country={country} 
            categories={categories} 
          />
        ))}
    </div>
  );
}