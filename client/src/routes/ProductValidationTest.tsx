import { fetchProducts } from "../../api/products";
/**
 * Product Compatibility Validation Test Page
 * Temporary page for testing the product validation script
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { validateAllProducts, generateCompatibilityReport } from '@/lib/devUtils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ValidationResult {
  productId: string;
  productName: string;
  lenderName: string;
  category: string;
  country: string;
  compatibilityScore: number;
  issues: string[];
  warnings: string[];
  canAppearInStep2: boolean;
  canSupplyDocumentsStep5: boolean;
}

interface ValidationSummary {
  totalProducts: number;
  fullyCompatible: number;
  partiallyCompatible: number;
  incompatible: number;
  averageCompatibilityScore: number;
  commonIssues: Record<string, number>;
  recommendations: string[];
}

export default function ProductValidationTest() {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<ValidationResult[] | null>(null);
  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    setError(null);
    
    try {
      const { results, summary } = await validateAllProducts();
      setResults(results);
      setSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const generateReport = async () => {
    setIsValidating(true);
    setError(null);
    
    try {
      const reportText = await generateCompatibilityReport();
      setReport(reportText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report generation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Product Compatibility Validation</h1>
        <p className="text-gray-600">
          Test all lender products against Step 2 and Step 5 business logic requirements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Button 
          onClick={runValidation} 
          disabled={isValidating}
          size="lg"
          className="h-12"
        >
          {isValidating ? 'Validating...' : 'Run Product Validation'}
        </Button>
        
        <Button 
          onClick={generateReport} 
          disabled={isValidating}
          variant="outline"
          size="lg"
          className="h-12"
        >
          {isValidating ? 'Generating...' : 'Generate Full Report'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-700">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Validation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.totalProducts}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.fullyCompatible}</div>
                <div className="text-sm text-gray-600">Fully Compatible (≥90%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summary.partiallyCompatible}</div>
                <div className="text-sm text-gray-600">Partially Compatible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.incompatible}</div>
                <div className="text-sm text-gray-600">Incompatible (&lt;50%)</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-lg font-semibold mb-2">
                Average Compatibility: {summary.averageCompatibilityScore}%
              </div>
              
              {summary.recommendations.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {summary.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Product Validation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {results
                  .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
                  .map((result) => (
                  <div key={result.productId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{result.productName}</h4>
                        <p className="text-sm text-gray-600">{result.lenderName}</p>
                      </div>
                      <Badge 
                        className={`${getScoreBadgeColor(result.compatibilityScore)} text-white`}
                      >
                        {result.compatibilityScore}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                      <div><strong>Category:</strong> {result.category}</div>
                      <div><strong>Country:</strong> {result.country}</div>
                      <div>
                        <strong>Step 2:</strong> 
                        <span className={result.canAppearInStep2 ? 'text-green-600' : 'text-red-600'}>
                          {result.canAppearInStep2 ? ' ✓' : ' ✗'}
                        </span>
                      </div>
                      <div>
                        <strong>Step 5:</strong>
                        <span className={result.canSupplyDocumentsStep5 ? 'text-green-600' : 'text-red-600'}>
                          {result.canSupplyDocumentsStep5 ? ' ✓' : ' ✗'}
                        </span>
                      </div>
                    </div>
                    
                    {result.issues.length > 0 && (
                      <div className="mb-2">
                        <strong className="text-red-600">Issues:</strong>
                        <ul className="list-disc pl-5 text-sm text-red-700">
                          {result.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.warnings.length > 0 && (
                      <div>
                        <strong className="text-yellow-600">Warnings:</strong>
                        <ul className="list-disc pl-5 text-sm text-yellow-700">
                          {result.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {report && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Full Compatibility Report</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <pre className="text-sm whitespace-pre-wrap font-mono">{report}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}