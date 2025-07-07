/**
 * Step 5 Intersection Test Component
 * Tests the client-side document intersection logic
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDocumentRequirementsIntersection } from '@/lib/documentIntersection';
import { CheckCircle, AlertTriangle, Calculator, Play } from 'lucide-react';

export default function Step5IntersectionTest() {
  const [testParams, setTestParams] = useState({
    selectedProductType: 'Working Capital',
    businessLocation: 'canada',
    fundingAmount: 40000
  });

  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunTest = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      console.log('🧪 [TEST] Running intersection test with params:', testParams);
      
      const intersectionResults = await getDocumentRequirementsIntersection(
        testParams.selectedProductType,
        testParams.businessLocation,
        testParams.fundingAmount
      );

      setResults(intersectionResults);
      console.log('🧪 [TEST] Results:', intersectionResults);

    } catch (error) {
      console.error('🧪 [TEST] Error:', error);
      setResults({
        eligibleLenders: [],
        requiredDocuments: [],
        message: `Test Error: ${error.message}`,
        hasMatches: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test scenarios
  const testScenarios = [
    {
      name: 'Canadian Working Capital $40K',
      params: {
        selectedProductType: 'Working Capital',
        businessLocation: 'canada',
        fundingAmount: 40000
      }
    },
    {
      name: 'US Business Line of Credit $100K',
      params: {
        selectedProductType: 'Business Line of Credit',
        businessLocation: 'united-states',
        fundingAmount: 100000
      }
    },
    {
      name: 'Canadian Term Loan $25K',
      params: {
        selectedProductType: 'Term Loan',
        businessLocation: 'canada',
        fundingAmount: 25000
      }
    },
    {
      name: 'US Equipment Financing $75K',
      params: {
        selectedProductType: 'Equipment Financing',
        businessLocation: 'united-states',
        fundingAmount: 75000
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              <span>Step 5 Document Intersection Logic Test</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Test the client-side document intersection logic that filters matching lenders 
              and computes the intersection of their required documents.
            </p>
          </CardContent>
        </Card>

        {/* Test Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Test Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Type</label>
                <Select
                  value={testParams.selectedProductType}
                  onValueChange={(value) => setTestParams(prev => ({ ...prev, selectedProductType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Working Capital">Working Capital</SelectItem>
                    <SelectItem value="Business Line of Credit">Business Line of Credit</SelectItem>
                    <SelectItem value="Term Loan">Term Loan</SelectItem>
                    <SelectItem value="Equipment Financing">Equipment Financing</SelectItem>
                    <SelectItem value="Invoice Factoring">Invoice Factoring</SelectItem>
                    <SelectItem value="Asset-Based Lending">Asset-Based Lending</SelectItem>
                    <SelectItem value="Purchase Order Financing">Purchase Order Financing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Business Location</label>
                <Select
                  value={testParams.businessLocation}
                  onValueChange={(value) => setTestParams(prev => ({ ...prev, businessLocation: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="united-states">United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Funding Amount ($)</label>
                <Input
                  type="number"
                  value={testParams.fundingAmount}
                  onChange={(e) => setTestParams(prev => ({ ...prev, fundingAmount: parseInt(e.target.value) || 0 }))}
                  placeholder="40000"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleRunTest} disabled={isLoading} className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>{isLoading ? 'Testing...' : 'Run Intersection Test'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Test Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testScenarios.map((scenario, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => {
                    setTestParams(scenario.params);
                    setTimeout(() => handleRunTest(), 100);
                  }}
                  className="text-left justify-start h-auto p-3"
                >
                  <div>
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-xs text-gray-500">
                      {scenario.params.selectedProductType} • {scenario.params.businessLocation} • ${scenario.params.fundingAmount.toLocaleString()}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {results.hasMatches ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <span>Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.hasMatches ? (
                <div className="space-y-4">
                  {/* Matching Lenders */}
                  <div>
                    <h4 className="font-semibold mb-2">
                      Eligible Lenders ({results.eligibleLenders.length}):
                    </h4>
                    <div className="space-y-2">
                      {results.eligibleLenders.map((lender, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium">{lender.lenderName}: {lender.name}</div>
                          <div className="text-sm text-gray-600">
                            Category: {lender.category} • 
                            Amount: ${lender.amountMin?.toLocaleString()} - ${lender.amountMax?.toLocaleString()} • 
                            Country: {lender.country}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Required Documents: [{lender.requiredDocuments?.join(', ') || 'None'}]
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document Intersection */}
                  <div>
                    <h4 className="font-semibold mb-2">
                      Document Intersection ({results.requiredDocuments.length} documents):
                    </h4>
                    {results.requiredDocuments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {results.requiredDocuments.map((doc, index) => (
                          <Badge key={index} variant="default" className="p-2 justify-start">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No documents are required by ALL matching lenders.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Message */}
                  <Alert>
                    <AlertDescription>{results.message}</AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>No Matches:</strong> {results.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}