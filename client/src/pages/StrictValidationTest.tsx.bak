import { fetchProducts } from "../../api/products";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { fetchLenderProducts } from '@/lib/api';
import { getProductRecommendations, type RecommendationFilters } from '@/lib/strictRecommendationEngine';
import { getDocumentRequirements } from '@/lib/lenderProductNormalizer';

export default function StrictValidationTest() {
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['lender-products-strict'],
    queryFn: fetchLenderProducts,
  });

  // Test recommendation filters
  const testFilters: RecommendationFilters = {
    country: 'US',
    fundingAmount: 40000,
    lookingFor: 'capital',
    accountsReceivableBalance: 25000,
    fundsPurpose: 'working_capital'
  };

  const recommendations = products.length > 0 
    ? getProductRecommendations(products, testFilters)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Strict Validation System Test</h1>
          <p className="text-gray-600">
            Testing TypeScript + Zod validation with fail-fast error handling
          </p>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Real Staff Database → Strict Validation → Recommendation Engine
          </Badge>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600 mt-4">Loading and validating products...</p>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                Validation Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">Error: {(error as Error).message}</p>
              <p className="text-sm text-red-500 mt-2">
                This indicates either staff API issues or data validation failures
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Validation Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Validation Results
                </CardTitle>
                <CardDescription>
                  Staff JSON → Zod Schema → Strict TypeScript Model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-700">{products.length}</div>
                      <div className="text-sm text-green-600">Products Validated</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">
                        {new Set(products.map(p => p.category)).size}
                      </div>
                      <div className="text-sm text-blue-600">Categories Found</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Product Categories (Validated Enums)</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(products.map(p => p.category))).map(category => (
                        <Badge key={category} variant="secondary">
                          {category.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Countries (Validated Enums)</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(products.map(p => p.country))).map(country => (
                        <Badge key={country} variant="outline">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Sample Validated Product</h4>
                    {products[0] && (
                      <div className="text-sm space-y-1">
                        <div><strong>Name:</strong> {products[0].name}</div>
                        <div><strong>Lender:</strong> {products[0].lenderName}</div>
                        <div><strong>Category:</strong> {products[0].category}</div>
                        <div><strong>Country:</strong> {products[0].country}</div>
                        <div><strong>Amount:</strong> ${products[0].minAmount.toLocaleString()} - ${products[0].maxAmount.toLocaleString()}</div>
                        <div><strong>Documents:</strong> {products[0].docRequirements.length} required</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendation Engine Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Strict Recommendation Engine
                </CardTitle>
                <CardDescription>
                  Testing $40K US capital loan scenario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-800 mb-2">Test Filters</h4>
                    <div className="text-sm text-orange-700 space-y-1">
                      <div>Country: {testFilters.country}</div>
                      <div>Amount: ${testFilters.fundingAmount.toLocaleString()}</div>
                      <div>Looking For: {testFilters.lookingFor}</div>
                      <div>AR Balance: ${testFilters.accountsReceivableBalance?.toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Recommendations ({recommendations.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {recommendations.slice(0, 5).map((rec, idx) => (
                        <div key={rec.product.id} className="border rounded-lg p-3 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{rec.product.name}</div>
                              <div className="text-sm text-gray-600">{rec.product.lenderName}</div>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant={rec.recommendationLevel === 'excellent' ? 'default' : 'secondary'}
                                className="mb-1"
                              >
                                {rec.matchScore}% match
                              </Badge>
                              <div className="text-xs text-gray-500">{rec.recommendationLevel}</div>
                            </div>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <div>Category: {rec.product.category}</div>
                            <div>Range: ${rec.product.minAmount.toLocaleString()} - ${rec.product.maxAmount.toLocaleString()}</div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="text-xs text-gray-600 mb-1">Match Reasons:</div>
                            {rec.matchReasons.slice(0, 2).map((reason, i) => (
                              <div key={i} className="text-xs text-green-700">• {reason}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {recommendations.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No products match the test criteria</p>
                      <p className="text-xs">This indicates potential data quality issues</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Document Requirements Test */}
        {products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Document Requirements Validation</CardTitle>
              <CardDescription>
                Testing document requirements mapping for each category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(new Set(products.map(p => p.category))).map(category => {
                  const docs = getDocumentRequirements(category);
                  return (
                    <div key={category} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2 capitalize">
                        {category.replace('_', ' ')}
                      </h4>
                      <div className="text-sm text-gray-600 mb-2">
                        {docs.length} documents required
                      </div>
                      <div className="space-y-1">
                        {docs.slice(0, 3).map((doc, idx) => (
                          <div key={idx} className="text-xs text-gray-700">
                            • {doc}
                          </div>
                        ))}
                        {docs.length > 3 && (
                          <div className="text-xs text-gray-500">
                            + {docs.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {error ? (
                <Badge variant="destructive">System Validation Failed</Badge>
              ) : isLoading ? (
                <Badge variant="secondary">Validating...</Badge>
              ) : (
                <Badge variant="default" className="bg-green-600">
                  ✓ Strict Validation System Operational
                </Badge>
              )}
              <p className="text-sm text-gray-600 mt-2">
                {error 
                  ? 'Data validation or API connection failed'
                  : isLoading 
                  ? 'Loading and validating product data...'
                  : `${products.length} products validated successfully with ${recommendations.length} recommendations generated`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}