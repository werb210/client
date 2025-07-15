/**
 * Demonstration of typed API integration using generated OpenAPI types
 * Shows both lender products and SignNow integration with type safety
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Code from 'lucide-react/dist/esm/icons/code';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import { useTypedLenderProducts, formatFundingAmount, formatInterestRate, getProductDetails } from '@/hooks/useTypedLenderProducts';
import { paths } from '@/types/api';

// Extract types for demonstration
type GeneratePayload = paths['/api/signnow/generate']['post']['requestBody']['content']['application/json'];

export default function TypedApiDemo() {
  const { data: lenderData, isLoading, error } = useTypedLenderProducts();

  // Example typed payload for SignNow
  const exampleSignNowPayload: GeneratePayload = {
    applicationId: "demo-app-123",
    formFields: {
      businessName: "Acme Corporation",
      ownerName: "John Smith",
      requestedAmount: 50000,
      businessType: "LLC",
      businessAddress: "123 Main St",
      businessCity: "New York",
      businessState: "NY",
      businessPostalCode: "10001",
      annualRevenue: 500000,
      phoneNumber: "(555) 123-4567",
      email: "john@acme.com"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Typed API Integration Demo</h1>
          <p className="text-gray-600">
            Demonstrating strongly-typed API calls using generated OpenAPI types
          </p>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Type-Safe • Auto-Generated • Production Ready
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lender Products API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Typed Lender Products API
              </CardTitle>
              <CardDescription>
                Using generated types from OpenAPI schema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading typed products...</p>
                </div>
              ) : error ? (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    Error loading products: {(error as Error).message}
                  </AlertDescription>
                </Alert>
              ) : lenderData ? (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-700">
                      Successfully loaded {lenderData.products.length} typed products
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {lenderData.products.slice(0, 5).map((product) => {
                      const details = getProductDetails(product);
                      return (
                        <div key={product.id} className="border rounded-lg p-3 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{details.product}</div>
                              <div className="text-sm text-gray-600">{details.lender}</div>
                            </div>
                            <Badge variant="secondary">{details.category}</Badge>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <div><strong>Amount:</strong> {details.amountRange}</div>
                            <div><strong>Rate:</strong> {details.interestRate}</div>
                            <div><strong>Term:</strong> {details.termRange}</div>
                            <div><strong>Type:</strong> {details.rateType}</div>
                          </div>

                          {details.requiredDocs.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs text-gray-600 mb-1">Required Documents:</div>
                              <div className="flex flex-wrap gap-1">
                                {details.requiredDocs.slice(0, 3).map((doc, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {doc}
                                  </Badge>
                                ))}
                                {details.requiredDocs.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{details.requiredDocs.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {lenderData.products.length > 5 && (
                    <div className="text-center text-sm text-gray-600">
                      Showing 5 of {lenderData.products.length} products
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* SignNow API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Typed SignNow Integration
              </CardTitle>
              <CardDescription>
                Type-safe document generation API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-blue-700">
                    SignNow payload types generated from OpenAPI schema
                  </AlertDescription>
                </Alert>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Example Typed Payload</h4>
                  <pre className="text-xs overflow-auto">
{JSON.stringify(exampleSignNowPayload, null, 2)}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Type Benefits:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Compile-time validation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>IntelliSense support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Auto-completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Refactoring safety</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Typed Component
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Examples</CardTitle>
            <CardDescription>
              How to use the generated types in your components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Lender Products Hook</h4>
                <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
{`import { useTypedLenderProducts } from '@/hooks/useTypedLenderProducts';

export function ProductsList() {
  const { data, isLoading, error } = useTypedLenderProducts({
    productCategory: 'Working Capital',
    minAmount: 10000,
    maxAmount: 100000
  });

  // TypeScript knows data.products exists
  // and each product has typed properties
  return (
    <div>
      {data?.products.map(product => (
        <div key={product.id}>
          <h3>{product.product}</h3>
          <p>{product.lender}</p>
          <p>{product.minAmountUsd} - {product.maxAmountUsd}</p>
        </div>
      ))}
    </div>
  );
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">SignNow Integration</h4>
                <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
{`import { paths } from '@/types/api';

type GeneratePayload = paths['/api/signnow/generate']['post']
  ['requestBody']['content']['application/json'];

export function generateDocument(formData: any) {
  const payload: GeneratePayload = {
    applicationId: formData.id,
    formFields: {
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      requestedAmount: formData.amount,
      // TypeScript validates all required fields
    }
  };

  return fetch('/api/signnow/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="default" className="bg-green-600">
                ✓ Typed API Integration Complete
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                OpenAPI types generated successfully. All API calls are now type-safe.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}