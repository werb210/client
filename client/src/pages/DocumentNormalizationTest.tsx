/**
 * Document Normalization Test Page
 * Tests and demonstrates the document name normalization utilities
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Database from 'lucide-react/dist/esm/icons/database';
import { 
  normalizeDocumentNames, 
  normalizeDocumentName, 
  hasLegacyDocumentNames, 
  cleanupLegacyDocumentNames 
} from '@/utils/documentNormalization';
import { getCacheStats } from '@/utils/lenderCache';

export default function DocumentNormalizationTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [legacyCheck, setLegacyCheck] = useState<{ hasLegacy: boolean; checked: boolean }>({ hasLegacy: false, checked: false });
  const [cleanupResult, setCleanupResult] = useState<{ updated: boolean; productCount: number } | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Test document name normalization
  const runNormalizationTests = () => {
    const testCases = [
      'Financial Statements',
      'Audited Financials',
      'Accountant Prepared Financial Statements',
      'Bank Statements',
      'Tax Returns',
      'Equipment Quote'
    ];

    const results = testCases.map(testCase => ({
      original: testCase,
      normalized: normalizeDocumentName(testCase),
      wasChanged: normalizeDocumentName(testCase) !== testCase
    }));

    setTestResults(results);
  };

  // Check for legacy document names in cache
  const checkLegacyNames = async () => {
    setIsLoading(true);
    try {
      const hasLegacy = await hasLegacyDocumentNames();
      setLegacyCheck({ hasLegacy, checked: true });
    } catch (error) {
      console.error('Failed to check legacy names:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run cleanup on IndexedDB cache
  const runCleanup = async () => {
    setIsLoading(true);
    try {
      const result = await cleanupLegacyDocumentNames();
      setCleanupResult(result);
      
      // Refresh legacy check after cleanup
      await checkLegacyNames();
    } catch (error) {
      console.error('Failed to run cleanup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load cache statistics
  const loadCacheStats = async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  useEffect(() => {
    runNormalizationTests();
    checkLegacyNames();
    loadCacheStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Normalization Test</h1>
          <p className="text-gray-600">Test and manage document name normalization utilities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Normalization Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Name Normalization Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runNormalizationTests} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Tests
              </Button>
              
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{result.original}</span>
                      <span className="text-xs text-gray-500">→ {result.normalized}</span>
                    </div>
                    <Badge variant={result.wasChanged ? "default" : "secondary"}>
                      {result.wasChanged ? "Normalized" : "No Change"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cache Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                IndexedDB Cache Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Cache Stats */}
              {cacheStats && (
                <div className="p-3 bg-blue-50 rounded border">
                  <div className="text-sm font-medium text-blue-900">Cache Statistics</div>
                  <div className="text-xs text-blue-700 mt-1">
                    Products: {cacheStats.productCount} | 
                    Age: {cacheStats.age} | 
                    Last Fetch: {cacheStats.lastFetch ? new Date(cacheStats.lastFetch).toLocaleString() : 'Never'}
                  </div>
                </div>
              )}

              {/* Legacy Check */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Legacy Document Names</div>
                  <div className="text-xs text-gray-500">Check if cache contains old naming</div>
                </div>
                <div className="flex items-center gap-2">
                  {legacyCheck.checked && (
                    <Badge variant={legacyCheck.hasLegacy ? "destructive" : "default"}>
                      {legacyCheck.hasLegacy ? "Found Legacy Names" : "Clean"}
                    </Badge>
                  )}
                  <Button 
                    onClick={checkLegacyNames} 
                    variant="outline" 
                    size="sm" 
                    disabled={isLoading}
                  >
                    Check
                  </Button>
                </div>
              </div>

              {/* Cleanup Action */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Cleanup Legacy Names</div>
                  <div className="text-xs text-gray-500">Normalize cached document names</div>
                </div>
                <Button 
                  onClick={runCleanup} 
                  variant={legacyCheck.hasLegacy ? "default" : "outline"}
                  size="sm" 
                  disabled={isLoading}
                >
                  {isLoading ? "Running..." : "Clean Up"}
                </Button>
              </div>

              {/* Cleanup Results */}
              {cleanupResult && (
                <div className={`p-3 rounded border ${cleanupResult.updated ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    {cleanupResult.updated ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                    )}
                    <div className="text-sm font-medium">
                      {cleanupResult.updated ? 'Cleanup Completed' : 'No Updates Needed'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Processed {cleanupResult.productCount} products
                    {cleanupResult.updated && ' - Legacy names normalized'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Normalization Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">"Financial Statements"</span>
                <span>→ "Accountant Prepared Financial Statements"</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">"Audited Financials"</span>
                <span>→ "Accountant Prepared Financial Statements"</span>
              </div>
              <div className="text-xs text-gray-500 mt-3">
                All affected products will now map to the new document name with a required quantity of 3 files.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}