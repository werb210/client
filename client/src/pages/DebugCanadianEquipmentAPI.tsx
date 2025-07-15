import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Search, Database } from 'lucide-react';

export default function DebugCanadianEquipmentAPI() {
  const [debugResults, setDebugResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDebugAnalysis = async () => {
    setIsRunning(true);
    setDebugResults(null);
    
    // console.log("🔍 DEBUGGING CANADIAN EQUIPMENT FINANCING API DATA");
    // console.log("=".repeat(60));
    
    try {
      // Fetch all products from API
      const response = await fetch('/api/public/lenders');
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        console.error("❌ API request failed:", data);
        setDebugResults({ error: "API request failed", details: data });
        return;
      }
      
      const products = data.products;
      // console.log(`✅ API returned ${products.length} total products`);
      
      // Debug: Log the structure of first few products
      // console.log("\n📋 SAMPLE PRODUCT STRUCTURE:");
      // console.log("=".repeat(40));
      const sampleProducts = products.slice(0, 3).map((product: any, index: number) => {
        const sample = {
          id: product.id,
          name: product.name || product.lender,
          geography: product.geography,
          country: product.country,
          productCategory: product.productCategory,
          product: product.product,
          type: product.type,
          minAmount: product.minAmount || product.minAmountUsd,
          maxAmount: product.maxAmount || product.maxAmountUsd,
          requiredDocuments: product.requiredDocuments?.length || 0
        };
        // console.log(`Product ${index + 1}:`, sample);
        return sample;
      });
      
      // Look for Canadian products (any field that might indicate Canada)
      // console.log("\n🇨🇦 SEARCHING FOR CANADIAN PRODUCTS:");
      // console.log("=".repeat(40));
      
      const canadianProducts = products.filter((p: any) => {
        const hasCanada = 
          (p.geography && p.geography.includes && p.geography.includes('CA')) ||
          (p.country && p.country.toLowerCase().includes('canada')) ||
          (p.geography && typeof p.geography === 'string' && p.geography.includes('Canada')) ||
          (Array.isArray(p.geography) && p.geography.includes('Canada'));
        
        if (hasCanada) {
          // console.log(`Found Canadian product: ${p.name || p.lender}`, {
          //   geography: p.geography,
          //   country: p.country,
          //   productType: p.productCategory || p.product || p.type
          // });
        }
        
        return hasCanada;
      });
      
      // console.log(`\n📊 Found ${canadianProducts.length} Canadian products total`);
      
      // Look for Equipment Financing products
      // console.log("\n🏗️ SEARCHING FOR EQUIPMENT FINANCING PRODUCTS:");
      // console.log("=".repeat(50));
      
      const equipmentProducts = products.filter((p: any) => {
        const hasEquipment = 
          (p.productCategory && p.productCategory.toLowerCase().includes('equipment')) ||
          (p.product && p.product.toLowerCase().includes('equipment')) ||
          (p.type && p.type.toLowerCase().includes('equipment'));
        
        if (hasEquipment) {
          // console.log(`Found equipment product: ${p.name || p.lender}`, {
          //   productCategory: p.productCategory,
          //   product: p.product,
          //   type: p.type,
          //   geography: p.geography,
          //   country: p.country
          // });
        }
        
        return hasEquipment;
      });
      
      // console.log(`\n📊 Found ${equipmentProducts.length} equipment financing products total`);
      
      // Look for the intersection: Canadian + Equipment
      // console.log("\n🎯 SEARCHING FOR CANADIAN EQUIPMENT FINANCING:");
      // console.log("=".repeat(50));
      
      const canadianEquipmentProducts = products.filter((p: any) => {
        const hasCanada = 
          (p.geography && p.geography.includes && p.geography.includes('CA')) ||
          (p.country && p.country.toLowerCase().includes('canada')) ||
          (p.geography && typeof p.geography === 'string' && p.geography.includes('Canada')) ||
          (Array.isArray(p.geography) && p.geography.includes('Canada'));
        
        const hasEquipment = 
          (p.productCategory && p.productCategory.toLowerCase().includes('equipment')) ||
          (p.product && p.product.toLowerCase().includes('equipment')) ||
          (p.type && p.type.toLowerCase().includes('equipment'));
        
        const matches = hasCanada && hasEquipment;
        
        if (matches) {
          // console.log(`✅ MATCH: ${p.name || p.lender}`, {
          //   geography: p.geography,
          //   country: p.country,
          //   productCategory: p.productCategory,
          //   product: p.product,
          //   type: p.type,
          //   minAmount: p.minAmount || p.minAmountUsd,
          //   maxAmount: p.maxAmount || p.maxAmountUsd,
          //   requiredDocuments: p.requiredDocuments?.slice(0, 3) || []
          // });
        }
        
        return matches;
      });
      
      // console.log(`\n🎯 FINAL RESULT: ${canadianEquipmentProducts.length} Canadian Equipment Financing products found`);
      
      // Check for the expected 4 lenders
      // console.log("\n🔍 SEARCHING FOR EXPECTED LENDERS:");
      // console.log("=".repeat(40));
      
      const expectedLenders = [
        'Stride Capital Corp',
        'Accord Financial Corp', 
        'Dynamic Capital Equipment Finance',
        'Meridian OneCap Credit Corp'
      ];
      
      const foundLenders = expectedLenders.map(expectedName => {
        const found = products.find((p: any) => 
          (p.name && p.name.includes(expectedName.split(' ')[0])) ||
          (p.lender && p.lender.includes(expectedName.split(' ')[0]))
        );
        
        if (found) {
          // console.log(`✅ Found: ${expectedName}`, {
          //   actualName: found.name || found.lender,
          //   geography: found.geography,
          //   country: found.country,
          //   productType: found.productCategory || found.product || found.type
          // });
          return { expected: expectedName, found: found, status: 'found' };
        } else {
          // console.log(`❌ Missing: ${expectedName}`);
          return { expected: expectedName, found: null, status: 'missing' };
        }
      });
      
      // Analyze field variations
      const geographyValues = [...new Set(products.map((p: any) => JSON.stringify(p.geography)).filter(Boolean))];
      const countryValues = [...new Set(products.map((p: any) => p.country).filter(Boolean))];
      const productCategoryValues = [...new Set(products.map((p: any) => p.productCategory).filter(Boolean))];
      const productValues = [...new Set(products.map((p: any) => p.product).filter(Boolean))];
      const typeValues = [...new Set(products.map((p: any) => p.type).filter(Boolean))];
      
      // console.log("\n📊 FIELD ANALYSIS:");
      // console.log("Geography field values:", geographyValues.slice(0, 5));
      // console.log("Country field values:", countryValues.slice(0, 5));
      // console.log("ProductCategory values:", productCategoryValues.slice(0, 5));
      // console.log("Product values:", productValues.slice(0, 5));
      // console.log("Type values:", typeValues.slice(0, 5));
      
      // Set results for UI display
      setDebugResults({
        totalProducts: products.length,
        sampleProducts,
        canadianProducts: canadianProducts.length,
        equipmentProducts: equipmentProducts.length,
        canadianEquipmentProducts: canadianEquipmentProducts.length,
        foundLenders,
        fieldAnalysis: {
          geography: geographyValues.slice(0, 10),
          country: countryValues.slice(0, 10),
          productCategory: productCategoryValues.slice(0, 10),
          product: productValues.slice(0, 10),
          type: typeValues.slice(0, 10)
        },
        rawProducts: products.slice(0, 5) // First 5 for detailed inspection
      });
      
    } catch (error) {
      console.error("❌ Debug failed:", error);
      setDebugResults({ error: "Debug failed", details: error });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Debug Canadian Equipment Financing API
          </CardTitle>
          <p className="text-sm text-gray-600">
            Investigating data structure and field values to identify why Canadian equipment financing products aren't being found
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runDebugAnalysis} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Analyzing API Data...' : 'Run Debug Analysis'}
          </Button>
        </CardContent>
      </Card>

      {debugResults && (
        <>
          {debugResults.error ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Debug Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{debugResults.error}</p>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(debugResults.details, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{debugResults.totalProducts}</div>
                      <div className="text-sm text-gray-600">Total Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{debugResults.canadianProducts}</div>
                      <div className="text-sm text-gray-600">Canadian Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{debugResults.equipmentProducts}</div>
                      <div className="text-sm text-gray-600">Equipment Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{debugResults.canadianEquipmentProducts}</div>
                      <div className="text-sm text-gray-600">Canadian Equipment</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expected Lenders Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {debugResults.foundLenders.map((lender: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{lender.expected}</div>
                          {lender.found && (
                            <div className="text-sm text-gray-600">
                              Found as: {lender.found.name || lender.found.lender}
                            </div>
                          )}
                        </div>
                        <Badge variant={lender.status === 'found' ? 'default' : 'destructive'}>
                          {lender.status === 'found' ? 'FOUND' : 'MISSING'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Field Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Geography Field Values:</h4>
                      <div className="flex flex-wrap gap-1">
                        {debugResults.fieldAnalysis.geography.map((value: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Product Category Values:</h4>
                      <div className="flex flex-wrap gap-1">
                        {debugResults.fieldAnalysis.productCategory.map((value: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Product Values:</h4>
                      <div className="flex flex-wrap gap-1">
                        {debugResults.fieldAnalysis.product.map((value: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sample Product Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(debugResults.rawProducts, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}