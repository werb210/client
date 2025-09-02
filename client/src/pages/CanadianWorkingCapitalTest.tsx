import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePublicLenders } from '@/hooks/usePublicLenders';
import { recommend } from '@/lib/reco/engine';
import { normalizeProducts } from '@/lib/products/normalize';

// Adapter function to maintain compatibility
function filterProducts(products: any[], formData: any): any[] {
  if (!products || products.length === 0) return [];
  
  const normalizedProducts = normalizeProducts(products);
  const filters = {
    country: formData.businessLocation === 'CA' ? 'CA' : 'US',
    fundingAmount: formData.fundingAmount || 0,
    productPreference: (formData.lookingFor || 'capital') as 'capital' | 'equipment' | 'both',
    hasAR: (formData.accountsReceivableBalance || 0) > 0,
    purpose: formData.fundsPurpose || 'general'
  };
  
  const recommendations = recommend(normalizedProducts, filters, 50);
  return recommendations.map(r => r.product);
}

export default function CanadianWorkingCapitalTest() {
  const { data: lenderProducts, isLoading, error } = usePublicLenders();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterCount, setFilterCount] = useState(0);

  const testScenario = {
    businessLocation: 'CA',
    lookingFor: 'capital',
    fundingAmount: 40000,
    fundsPurpose: 'working_capital',
    accountsReceivableBalance: 0 // No AR to test invoice factoring exclusion
  };

  useEffect(() => {
    if (lenderProducts && lenderProducts.length > 0) {
      // console.log('🇨🇦 Testing Canadian Working Capital Scenario');
      // console.log('📊 Total products available:', lenderProducts.length);
      
      const filtered = filterProducts(lenderProducts, testScenario);
      setFilteredProducts(filtered);
      setFilterCount(filtered.length);
      
      // console.log('🎯 Filtered products for Canadian $40K working capital:', filtered.length);
      // console.log('💼 Products breakdown:');
      
      // Group by product category
      const categoryBreakdown = filtered.reduce((acc, product) => {
        const category = product.productCategory || product.product || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(categoryBreakdown).forEach(([category, count]) => {
        // console.log(`  • ${category}: ${count} products`);
      });
      
      // Show specific products
      // console.log('\n📋 Available products:');
      filtered.forEach((product, index) => {
        // console.log(`${index + 1}. ${product.name || product.lender} - ${product.productCategory}`);
        // console.log(`   Amount: $${product.amountMin?.toLocaleString()} - $${product.amountMax?.toLocaleString()}`);
        // console.log(`   Geography: ${product.geography}`);
      });
    }
  }, [lenderProducts]);

  const runManualFilter = () => {
    if (lenderProducts) {
      // console.log('\n🔄 Running manual filter test...');
      
      // Step 1: Filter by geography (Canada)
      const canadianProducts = lenderProducts.filter(product => {
        const geo = product.geography || '';
        return geo.toLowerCase().includes('ca') || geo.toLowerCase().includes('canada');
      });
      // console.log(`🇨🇦 Canadian products: ${canadianProducts.length}`);
      
      // Step 2: Filter by amount ($40,000)
      const amountFiltered = canadianProducts.filter(product => {
        const min = product.amountMin || 0;
        const max = product.amountMax || Infinity;
        return 40000 >= min && 40000 <= max;
      });
      // console.log(`💰 Amount-eligible products: ${amountFiltered.length}`);
      
      // Step 3: Filter by product type (working capital)
      const capitalProducts = amountFiltered.filter(product => {
        const category = (product.productCategory || product.product || '').toLowerCase();
        return category.includes('working') || 
               category.includes('capital') ||
               category.includes('line_of_credit') ||
               category.includes('term_loan');
      });
      // console.log(`💼 Working capital products: ${capitalProducts.length}`);
      
      // Step 4: Exclude invoice factoring (no AR balance)
      const finalProducts = capitalProducts.filter(product => {
        const category = (product.productCategory || product.product || '').toLowerCase();
        return !category.includes('invoice') || testScenario.accountsReceivableBalance > 0;
      });
      // console.log(`✅ Final filtered products: ${finalProducts.length}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading lender products...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600">Error loading products: {error.message}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🇨🇦 Canadian Working Capital Test</h1>
          <p className="text-gray-600">Testing: Working capital, $40,000 in Canada</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Scenario</span>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {filterCount} Products Available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Location</p>
                <p className="text-lg font-bold">🇨🇦 Canada</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Amount</p>
                <p className="text-lg font-bold">$40,000</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Purpose</p>
                <p className="text-lg font-bold">Working Capital</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">AR Balance</p>
                <p className="text-lg font-bold">$0</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={runManualFilter} variant="outline">
                Run Manual Filter Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {lenderProducts && (
          <Card>
            <CardHeader>
              <CardTitle>Database Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Total Products</p>
                  <p className="text-2xl font-bold">{lenderProducts.length}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Canadian Products</p>
                  <p className="text-2xl font-bold">
                    {lenderProducts.filter(p => 
                      (p.geography || '').toLowerCase().includes('ca') || 
                      (p.geography || '').toLowerCase().includes('canada')
                    ).length}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">$40K Eligible</p>
                  <p className="text-2xl font-bold">
                    {lenderProducts.filter(p => 
                      40000 >= (p.amountMin || 0) && 40000 <= (p.amountMax || Infinity)
                    ).length}
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Filtered Result</p>
                  <p className="text-2xl font-bold text-purple-600">{filterCount}</p>
                </div>
              </div>

              {filteredProducts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Available Products for Canadian $40K Working Capital:</h3>
                  <div className="space-y-3">
                    {filteredProducts.map((product, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{product.name || product.lender}</h4>
                          <Badge variant="secondary">{product.productCategory}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Amount Range:</span>
                            <br />
                            ${product.amountMin?.toLocaleString()} - ${product.amountMax?.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Geography:</span>
                            <br />
                            {product.geography}
                          </div>
                          <div>
                            <span className="font-medium">Interest Rate:</span>
                            <br />
                            {product.interestRateMin}% - {product.interestRateMax}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
// injected: local-first products fetch
import { getProducts, loadSelectedCategories } from "../api/products";
/* injected load on mount (pseudo):
useEffect(() => { (async () => {
  const cats = loadSelectedCategories();
  const products = await getProducts({ useCacheFirst: true });
  // apply category filter if present
  const selected = cats && cats.length ? products.filter(p => cats.includes((p.category||"").toLowerCase())) : products;
  setState({ products: selected });
})(); }, []);
*/
