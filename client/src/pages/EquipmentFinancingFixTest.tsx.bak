import React, { useState, useEffect } from 'react';
import { fetchProducts } from "../api/products";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import Target from 'lucide-react/dist/esm/icons/target';

export default function EquipmentFinancingFixTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEquipmentFinancingProduct = (category: string): boolean => {
    const equipmentCategories = [
      'Equipment Financing',
      'Equipment Finance',
      'Asset-Based Lending',
      'Asset Based Lending'
    ];
    
    return equipmentCategories.some(cat => 
      category.toLowerCase().includes(cat.toLowerCase()) ||
      cat.toLowerCase().includes(category.toLowerCase())
    );
  };

  const runTest = async () => { /* ensure products fetched */ 
    setIsLoading(true);
    // console.log("🔧 TESTING EQUIPMENT FINANCING FIX");
    // console.log("=".repeat(50));
    
    try {
      const testScenario = {
        businessLocation: "canada",
        lookingFor: "equipment", 
        fundingAmount: "40000",
        accountsReceivable: "50k-to-100k"
      };
      
      // console.log("📋 Test Scenario:", testScenario);
      
      // Get all lender products from API
      const response = await /* rewired */
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        console.error("❌ API request failed:", data);
        return;
      }
      
      const products = data.products;
      // console.log(`✅ API returned ${products.length} total products`);
      
      // Find Equipment Financing products
      const equipmentProducts = products.filter((p: any) => p.category === 'Equipment Financing');
      // console.log(`🏗️ Equipment Financing products found: ${equipmentProducts.length}`);
      
      const canadianEquipmentProducts = equipmentProducts.filter((p: any) => p.country === 'CA');
      // console.log(`🇨🇦 Canadian Equipment Financing products: ${canadianEquipmentProducts.length}`);
      
      // Test if $40,000 fits in range
      const fundingAmount = 40000;
      const eligibleProducts = canadianEquipmentProducts.filter((p: any) => {
        const minAmount = p.minAmount || p.amountMin || 0;
        const maxAmount = p.maxAmount || p.amountMax || 999999999;
        return fundingAmount >= minAmount && fundingAmount <= maxAmount;
      });
      
      // Test the isEquipmentFinancingProduct function
      const testCategories = [
        'Equipment Financing',
        'Equipment Finance', 
        'Asset-Based Lending',
        'Asset Based Lending',
        'Working Capital',
        'Term Loan'
      ];
      
      const categoryTests = testCategories.map(category => ({
        category,
        isEquipment: isEquipmentFinancingProduct(category)
      }));
      
      // Simulate the filtering logic
      const filteredProducts = products.filter((product: any) => {
        // Country check
        if (product.country !== 'CA') {
          return false;
        }
        
        // Amount check 
        const minAmount = product.minAmount || product.amountMin || 0;
        const maxAmount = product.maxAmount || product.amountMax || 999999999;
        if (fundingAmount < minAmount || fundingAmount > maxAmount) {
          return false;
        }
        
        // Equipment financing check
        if (testScenario.lookingFor === "equipment") {
          return isEquipmentFinancingProduct(product.category);
        }
        
        return true;
      });
      
      // console.log(`🎯 FINAL RESULT: ${filteredProducts.length} products match Canadian equipment financing criteria`);
      
      setTestResults({
        totalProducts: products.length,
        equipmentProducts: equipmentProducts.length,
        canadianEquipmentProducts: canadianEquipmentProducts.length,
        eligibleProducts: eligibleProducts.length,
        filteredProducts: filteredProducts.length,
        categoryTests,
        canadianEquipmentDetails: canadianEquipmentProducts,
        finalFilteredDetails: filteredProducts,
        testScenario,
        isSuccess: filteredProducts.length >= 1
      });
      
      if (filteredProducts.length > 0) {
        // console.log("✅ SUCCESS: Equipment financing filtering is working!");
        filteredProducts.forEach((product: any, index: number) => {
          // console.log(`   ${index + 1}. ${product.name || product.lender} (${product.category})`);
        });
      } else {
        // console.log("❌ STILL BROKEN: No products returned for equipment financing");
      }
      
    } catch (error) {
      console.error("❌ Test failed:", error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Equipment Financing Fix Test
          </CardTitle>
          <p className="text-sm text-gray-600">
            Testing the fix for Canadian equipment financing product filtering
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runTest} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing Fix...' : 'Run Equipment Financing Test'}
          </Button>
        </CardContent>
      </Card>

      {testResults && (
        <>
          {testResults.error ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  Test Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{testResults.error}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${testResults.isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.isSuccess ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {testResults.isSuccess ? 'Fix Successful!' : 'Fix Still Needs Work'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{testResults.totalProducts}</div>
                      <div className="text-sm text-gray-600">Total Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{testResults.equipmentProducts}</div>
                      <div className="text-sm text-gray-600">Equipment Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{testResults.canadianEquipmentProducts}</div>
                      <div className="text-sm text-gray-600">Canadian Equipment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{testResults.eligibleProducts}</div>
                      <div className="text-sm text-gray-600">$40K Eligible</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${testResults.isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.filteredProducts}
                      </div>
                      <div className="text-sm text-gray-600">Final Result</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Scenario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="font-medium">Business Location</div>
                      <Badge variant="outline">{testResults.testScenario.businessLocation}</Badge>
                    </div>
                    <div>
                      <div className="font-medium">Looking For</div>
                      <Badge variant="outline">{testResults.testScenario.lookingFor}</Badge>
                    </div>
                    <div>
                      <div className="font-medium">Funding Amount</div>
                      <Badge variant="outline">${parseInt(testResults.testScenario.fundingAmount).toLocaleString()}</Badge>
                    </div>
                    <div>
                      <div className="font-medium">Accounts Receivable</div>
                      <Badge variant="outline">{testResults.testScenario.accountsReceivable}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Matching Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {testResults.categoryTests.map((test: any, index: number) => (
                      <div key={index} className={`flex items-center gap-2 p-2 border rounded ${test.isEquipment ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <span className={test.isEquipment ? 'text-green-600' : 'text-gray-600'}>
                          {test.isEquipment ? '✅' : '❌'}
                        </span>
                        <span className="font-medium">"{test.category}"</span>
                        <span className="text-sm text-gray-600">
                          → {test.isEquipment ? 'Equipment' : 'Not Equipment'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {testResults.canadianEquipmentDetails.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Canadian Equipment Financing Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {testResults.canadianEquipmentDetails.map((product: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{product.name || product.lender}</h3>
                            <div className="flex gap-2">
                              <Badge variant="outline">🇨🇦 {product.country}</Badge>
                              <Badge variant="secondary">{product.category}</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>ID: {product.id}</div>
                            <div>Amount Range: ${(product.minAmount || product.amountMin || 0).toLocaleString()} - ${(product.maxAmount || product.amountMax || 999999999).toLocaleString()}</div>
                            {product.requiredDocuments && (
                              <div>Required Docs: {product.requiredDocuments.slice(0, 3).join(', ')}{product.requiredDocuments.length > 3 ? '...' : ''}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {testResults.finalFilteredDetails.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Target className="w-5 h-5" />
                      Final Filtered Results (Success!)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {testResults.finalFilteredDetails.map((product: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 border-green-200 bg-green-50">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-green-800">{product.name || product.lender}</h3>
                            <div className="flex gap-2">
                              <Badge className="bg-green-100 text-green-800">✅ Matches</Badge>
                              <Badge variant="outline">{product.category}</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-green-700">
                            <div>Eligible for $40,000 Canadian equipment financing</div>
                            <div>Range: ${(product.minAmount || product.amountMin || 0).toLocaleString()} - ${(product.maxAmount || product.amountMax || 999999999).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}