import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Icons replaced with Unicode symbols to fix build timeout

interface IngestionResult {
  success: number;
  failed: number;
  errors: Array<{ index: number; product: string; error: string }>;
}

export default function DataIngestionInterface() {
  const [liveDataJson, setLiveDataJson] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleValidateData = () => {
    setValidationErrors([]);
    
    try {
      const data = JSON.parse(liveDataJson);
      
      if (!Array.isArray(data)) {
        setValidationErrors(['Data must be an array of product objects']);
        return;
      }
      
      const errors: string[] = [];
      const requiredFields = ['id', 'lender', 'product', 'productCategory', 'minAmountUsd', 'maxAmountUsd'];
      
      data.forEach((item, index) => {
        requiredFields.forEach(field => {
          if (!item[field]) {
            errors.push(`Product ${index + 1}: Missing required field "${field}"`);
          }
        });
        
        if (item.minAmountUsd && item.maxAmountUsd && item.minAmountUsd > item.maxAmountUsd) {
          errors.push(`Product ${index + 1}: minAmountUsd cannot be greater than maxAmountUsd`);
        }
      });
      
      if (errors.length > 0) {
        setValidationErrors(errors.slice(0, 10)); // Show first 10 errors
      } else {
        setValidationErrors(['✅ Data validation passed! Ready for ingestion.']);
      }
      
    } catch (error) {
      setValidationErrors(['Invalid JSON format']);
    }
  };

  const handleIngestData = async () => {
    setIsIngesting(true);
    setResult(null);
    
    try {
      const data = JSON.parse(liveDataJson);
      
      // Simulate ingestion process (replace with actual API call)
      const response = await fetch('/api/admin/ingest-live-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: data }),
      });
      
      if (!response.ok) {
        throw new Error(`Ingestion failed: ${response.status} ${response.statusText}`);
      }
      
      const ingestionResult = await response.json();
      setResult(ingestionResult);
      
    } catch (error) {
      console.error('Ingestion error:', error);
      setResult({
        success: 0,
        failed: 1,
        errors: [{ index: 0, product: 'Unknown', error: (error as Error).message }]
      });
    } finally {
      setIsIngesting(false);
    }
  };

  const exampleV2Data = {
    id: "prod-001",
    lender: "Capital One",
    product: "Business Line of Credit",
    productCategory: "Business Line of Credit",
    minAmountUsd: 10000,
    maxAmountUsd: 250000,
    interestRateMin: 7.5,
    interestRateMax: 24.99,
    termMinMonths: 12,
    termMaxMonths: 60,
    rateType: "variable",
    interestFrequency: "monthly",
    requiredDocs: [
      "Bank statements (3 months)",
      "Tax returns (2 years)",
      "Financial statements"
    ],
    minRevenue: 50000,
    industries: ["Manufacturing", "Retail", "Services"],
    description: "Flexible credit line for working capital needs",
    geography: ["US"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Live Data Ingestion Interface</h1>
          <p className="text-gray-600">
            Import your new live lender product data using the V2 expanded schema
          </p>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            V2 Schema • Strict Validation • Zero Test Data
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Data Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="h-5 w-5 flex items-center justify-center">📤</span>
                Live Data Input
              </CardTitle>
              <CardDescription>
                Paste your JSON array of lender products using the V2 schema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={liveDataJson}
                onChange={(e) => setLiveDataJson(e.target.value)}
                placeholder="Paste your live data JSON here..."
                className="min-h-[300px] font-mono text-sm"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleValidateData}
                  variant="outline"
                  disabled={!liveDataJson.trim()}
                >
                  Validate Data
                </Button>
                <Button 
                  onClick={handleIngestData}
                  disabled={!liveDataJson.trim() || isIngesting || validationErrors.some(e => !e.startsWith('✅'))}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isIngesting ? 'Ingesting...' : 'Ingest Live Data'}
                </Button>
              </div>

              {validationErrors.length > 0 && (
                <Alert className={validationErrors[0].startsWith('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <span className="h-4 w-4 flex items-center justify-center">⚠️</span>
                  <AlertDescription>
                    <div className="space-y-1">
                      {validationErrors.map((error, idx) => (
                        <div key={idx} className={validationErrors[0].startsWith('✅') ? 'text-green-700' : 'text-red-700'}>
                          {error}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* V2 Schema Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="h-5 w-5 flex items-center justify-center">🗄️</span>
                V2 Schema Example
              </CardTitle>
              <CardDescription>
                Reference schema for your live data format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-[400px]">
                {JSON.stringify([exampleV2Data], null, 2)}
              </pre>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">V2 Schema Changes</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>• <code>lenderName</code> → <code>lender</code></div>
                  <div>• <code>productName</code> → <code>product</code></div>
                  <div>• <code>category</code> → <code>productCategory</code></div>
                  <div>• <code>minAmount</code> → <code>minAmountUsd</code></div>
                  <div>• <code>maxAmount</code> → <code>maxAmountUsd</code></div>
                  <div>• Added: <code>interestRateMin/Max</code>, <code>termMinMonths/termMaxMonths</code></div>
                  <div>• Added: <code>rateType</code>, <code>interestFrequency</code>, <code>requiredDocs[]</code></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ingestion Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.failed === 0 ? (
                  <span className="h-5 w-5 flex items-center justify-center text-green-600">✅</span>
                ) : (
                  <span className="h-5 w-5 flex items-center justify-center text-red-600">❌</span>
                )}
                Ingestion Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{result.success}</div>
                  <div className="text-sm text-green-600">Products Successfully Ingested</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{result.failed}</div>
                  <div className="text-sm text-red-600">Products Failed</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Validation Errors:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.errors.map((error, idx) => (
                      <div key={idx} className="p-2 bg-red-50 rounded border border-red-200 text-sm">
                        <strong>Product "{error.product}" (index {error.index}):</strong> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.success > 0 && (
                <Alert className="mt-4 border-green-200 bg-green-50">
                  <span className="h-4 w-4 flex items-center justify-center">✅</span>
                  <AlertDescription className="text-green-700">
                    Live data ingestion completed! The client application will now use your new data with the V2 schema.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="default" className="bg-orange-600">
                🗑️ Database Cleared - Ready for Live Data
              </Badge>
              <p className="text-sm text-gray-600 mt-2">
                Previous test data removed. System configured for V2 schema with strict validation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}