import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { getDocumentRequirementsIntersection } from '@/lib/documentIntersection';

interface TestScenario {
  name: string;
  selectedProductType: string;
  businessLocation: string;
  fundingAmount: number;
  expectedLenders?: string[];
  expectedDocuments?: string[];
}

const testScenarios: TestScenario[] = [
  {
    name: 'Canadian Working Capital $40K (AccordAccess)',
    selectedProductType: 'Working Capital',
    businessLocation: 'canada',
    fundingAmount: 40000,
    expectedLenders: ['AccordAccess'],
    expectedDocuments: ['Bank Statements']
  },
  {
    name: 'US Working Capital $100K',
    selectedProductType: 'Working Capital',
    businessLocation: 'united-states',
    fundingAmount: 100000
  },
  {
    name: 'Canadian Equipment Financing $75K',
    selectedProductType: 'Equipment Financing',
    businessLocation: 'canada',
    fundingAmount: 75000
  },
  {
    name: 'US Term Loan $200K',
    selectedProductType: 'Term Loan',
    businessLocation: 'united-states',
    fundingAmount: 200000
  }
];

interface TestResult {
  scenario: TestScenario;
  result: any;
  success: boolean;
  error?: string;
}

export default function Step5IntersectionTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    for (const scenario of testScenarios) {
      try {
        console.log(`🧪 Testing: ${scenario.name}`);
        
        const result = await getDocumentRequirementsIntersection(
          scenario.selectedProductType,
          scenario.businessLocation,
          scenario.fundingAmount
        );

        const success = result.hasMatches && result.eligibleLenders.length > 0;
        
        // Check expectations if provided
        let expectationsMet = true;
        if (scenario.expectedLenders) {
          const actualLenderNames = result.eligibleLenders.map(l => l.name);
          expectationsMet = scenario.expectedLenders.every(expected => 
            actualLenderNames.includes(expected)
          );
        }

        results.push({
          scenario,
          result,
          success: success && expectationsMet,
          error: !expectationsMet ? 'Expected lenders not found' : undefined
        });

      } catch (error) {
        console.error(`❌ Test failed for ${scenario.name}:`, error);
        results.push({
          scenario,
          result: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const successCount = testResults.filter(r => r.success).length;
  const totalTests = testResults.length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Step 5 Document Intersection Tests</span>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Running...' : 'Run Tests'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length > 0 && (
            <div className="mb-4">
              <div className="text-lg font-semibold">
                Results: {successCount}/{totalTests} tests passed
              </div>
              <div className="text-sm text-gray-600">
                {successCount === totalTests ? 
                  '🎉 All tests passing!' : 
                  `⚠️ ${totalTests - successCount} tests failed`
                }
              </div>
            </div>
          )}

          <div className="space-y-4">
            {testResults.map((testResult, index) => (
              <Card key={index} className={`border-l-4 ${testResult.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{testResult.scenario.name}</span>
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Test Parameters */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Test Parameters</h4>
                      <div className="text-sm space-y-1">
                        <div><strong>Product Type:</strong> {testResult.scenario.selectedProductType}</div>
                        <div><strong>Location:</strong> {testResult.scenario.businessLocation}</div>
                        <div><strong>Amount:</strong> ${testResult.scenario.fundingAmount.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Results */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Results</h4>
                      {testResult.error ? (
                        <div className="text-red-600 text-sm">{String(testResult.error)}</div>
                      ) : testResult.result ? (
                        <div className="text-sm space-y-2">
                          <div>
                            <strong>Matches:</strong> {testResult.result.eligibleLenders.length}
                          </div>
                          {testResult.result.eligibleLenders.length > 0 && (
                            <div>
                              <strong>Lenders:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {testResult.result.eligibleLenders.map((lender, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {lender.name} ({lender.lenderName})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {testResult.result.requiredDocuments.length > 0 && (
                            <div>
                              <strong>Required Documents:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {testResult.result.requiredDocuments.map((doc, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {doc}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {testResult.result.message}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">No result data</div>
                      )}
                    </div>
                  </div>

                  {/* Expected vs Actual */}
                  {testResult.scenario.expectedLenders && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <h4 className="font-semibold text-sm mb-2">Expected vs Actual</h4>
                      <div className="text-sm">
                        <div><strong>Expected Lenders:</strong> {testResult.scenario.expectedLenders.join(', ')}</div>
                        <div><strong>Actual Lenders:</strong> {testResult.result?.eligibleLenders?.map(l => l.name).join(', ') || 'None'}</div>
                        {testResult.scenario.expectedDocuments && (
                          <>
                            <div><strong>Expected Documents:</strong> {testResult.scenario.expectedDocuments.join(', ')}</div>
                            <div><strong>Actual Documents:</strong> {testResult.result?.requiredDocuments?.join(', ') || 'None'}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-mono bg-gray-100 p-4 rounded">
            <div>API Endpoint: {import.meta.env.VITE_API_BASE_URL}/public/lenders</div>
            <div>Test Environment: {import.meta.env.NODE_ENV}</div>
            <div>Timestamp: {new Date().toISOString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}