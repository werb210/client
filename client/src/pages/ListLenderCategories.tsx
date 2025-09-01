import React, { useState, useEffect } from 'react';
import { getProducts } from "../api/products";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import List from 'lucide-react/dist/esm/icons/list';
import Database from 'lucide-react/dist/esm/icons/database';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';

export default function ListLenderCategories() {
  const [categories, setCategories] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCategories = async () => { /* ensure products fetched */ 
    setIsLoading(true);
    
    // console.log("📋 LISTING ALL LENDER PRODUCT CATEGORIES");
    // console.log("=".repeat(50));
    
    try {
      const response = await fetch('/api/v1/products');
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        console.error("❌ API request failed:", data);
        return;
      }
      
      const products = data.products;
      // console.log(`✅ API returned ${products.length} total products`);
      
      // Extract all unique categories
      const uniqueCategories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];
      const countries = [...new Set(products.map((p: any) => p.country).filter(Boolean))];
      
      // console.log("\n📊 AVAILABLE CATEGORIES:");
      // console.log("=".repeat(30));
      
      const categoryDetails = uniqueCategories.map(category => {
        const count = products.filter((p: any) => p.category === category).length;
        const canadianCount = products.filter((p: any) => p.category === category && p.country === 'CA').length;
        const usCount = products.filter((p: any) => p.category === category && p.country === 'US').length;
        const categoryProducts = products.filter((p: any) => p.category === category);
        
        // console.log(`- ${category}`);
        // console.log(`  Total: ${count} products (CA: ${canadianCount}, US: ${usCount})`);
        
        return {
          name: category,
          total: count,
          canadian: canadianCount,
          us: usCount,
          products: categoryProducts
        };
      });
      
      // console.log("\n🌍 AVAILABLE COUNTRIES:");
      // console.log("=".repeat(25));
      countries.forEach(country => {
        const count = products.filter((p: any) => p.country === country).length;
        // console.log(`- ${country}: ${count} products`);
      });
      
      // Check for equipment financing
      const equipmentCategories = uniqueCategories.filter(cat => 
        cat.toLowerCase().includes('equipment') || 
        cat.toLowerCase().includes('asset') ||
        cat.toLowerCase().includes('machinery')
      );
      
      // console.log("\n🔍 EQUIPMENT FINANCING CHECK:");
      // console.log("=".repeat(35));
      
      if (equipmentCategories.length === 0) {
        // console.log("❌ NO EQUIPMENT FINANCING CATEGORIES FOUND");
        // console.log("   Expected: 'Equipment Financing' category");
        // console.log("   Available: " + uniqueCategories.join(', '));
      } else {
        // console.log("✅ Equipment-related categories found:");
        equipmentCategories.forEach(cat => {
          // console.log(`   - ${cat}`);
        });
      }
      
      // Check for missing expected categories
      const expectedCategories = [
        'Equipment Financing',
        'Asset Based Lending', 
        'Purchase Order Financing',
        'Invoice Factoring',
        'SBA Loan'
      ];
      
      const missingCategories = expectedCategories.filter(expected => 
        !uniqueCategories.some(actual => actual.toLowerCase() === expected.toLowerCase())
      );
      
      // console.log("\n⚠️  MISSING EXPECTED CATEGORIES:");
      // console.log("=".repeat(40));
      
      if (missingCategories.length > 0) {
        // console.log("❌ Missing categories:");
        missingCategories.forEach(missing => {
          // console.log(`   - ${missing}`);
        });
      } else {
        // console.log("✅ All expected categories present");
      }
      
      setCategories({
        categoryDetails,
        countries,
        totalProducts: products.length,
        equipmentCategories,
        missingCategories,
        allCategories: uniqueCategories
      });
      
    } catch (error) {
      console.error("❌ Failed to list categories:", error);
      setCategories({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Lender Product Categories
          </CardTitle>
          <p className="text-sm text-gray-600">
            Complete list of all product categories available in the staff database
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={loadCategories} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Loading Categories...' : 'Refresh Categories'}
          </Button>
        </CardContent>
      </Card>

      {categories && (
        <>
          {categories.error ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Error Loading Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{categories.error}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{categories.totalProducts}</div>
                      <div className="text-sm text-gray-600">Total Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{categories.categoryDetails.length}</div>
                      <div className="text-sm text-gray-600">Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{categories.equipmentCategories.length}</div>
                      <div className="text-sm text-gray-600">Equipment Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{categories.missingCategories.length}</div>
                      <div className="text-sm text-gray-600">Missing Categories</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.categoryDetails.map((category: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          <div className="flex gap-2">
                            <Badge variant="outline">Total: {category.total}</Badge>
                            <Badge variant="secondary">CA: {category.canadian}</Badge>
                            <Badge variant="secondary">US: {category.us}</Badge>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {category.products.slice(0, 6).map((product: any, i: number) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="w-4 h-4 text-center text-xs">
                                  {product.country === 'CA' ? '🇨🇦' : '🇺🇸'}
                                </span>
                                <span>{product.name || product.lender}</span>
                              </div>
                            ))}
                            {category.products.length > 6 && (
                              <div className="text-gray-500 italic">
                                +{category.products.length - 6} more...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {categories.missingCategories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      Missing Expected Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categories.missingCategories.map((missing: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded border-red-200 bg-red-50">
                          <span className="text-red-600">❌</span>
                          <span className="font-medium">{missing}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>All Categories List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.allCategories.map((category: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}