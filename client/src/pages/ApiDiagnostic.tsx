import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// LEGACY SYNC IMPORTS DISABLED - Using new IndexedDB caching system
// import { syncLenderProducts } from '@/lib/lenderProductSync';
// import { scheduledSyncService } from '@/lib/scheduledSync';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'info';
  message: string;
  data?: any;
}

export default function ApiDiagnostic() {
  // Temporarily disabled due to sync manager refactoring
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">API Diagnostic</h1>
      <p className="text-gray-600">This page is temporarily disabled during final cleanup. Use the main application workflow for testing.</p>
    </div>
  );
  
}

/* Original function disabled - needs sync manager refactoring
function ApiDiagnosticOriginal() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [localProducts, setLocalProducts] = useState<any[]>([]);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Environment Variables
    addResult({
      test: 'Environment Variables',
      status: 'info',
      message: 'Checking environment configuration...',
      data: {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        VITE_STAFF_API_URL: import.meta.env.VITE_STAFF_API_URL,
        NODE_ENV: import.meta.env.NODE_ENV,
        PROD: import.meta.env.PROD,
        DEV: import.meta.env.DEV,
        allEnvVars: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
      }
    });

    // Test 1.1: Sync Status Check
    try {
      const status = await syncManager.getSyncStatus();
      const products = await syncManager.getProducts();
      setSyncStatus(status);
      setLocalProducts(products);
      
      addResult({
        test: 'IndexedDB Sync Status',
        status: status.productCount > 0 ? 'success' : 'info',
        message: `Local products: ${status.productCount}, Last sync: ${status.lastSyncTime ? new Date(status.lastSyncTime).toLocaleString() : 'Never'}`,
        data: {
          productCount: status.productCount,
          lastSyncTime: status.lastSyncTime,
          syncStatus: status.syncStatus,
          sampleProducts: products.slice(0, 3)
        }
      });
    } catch (error) {
      addResult({
        test: 'IndexedDB Sync Status',
        status: 'error',
        message: `Failed to check sync status: ${(error as Error).message}`
      });
    }

    // Test 2: Browser Console Direct Fetch
    addResult({
      test: 'Browser Console Test',
      status: 'info',
      message: 'Running direct fetch command as requested...'
    });

    try {
      const directResponse = await fetch('https://staffportal.replit.app/api/public/lenders');
      const directData = await directResponse.json();
      
      addResult({
        test: 'Direct Console Fetch',
        status: directResponse.ok ? 'success' : 'error',
        message: `Status: ${directResponse.status} ${directResponse.statusText}`,
        data: {
          status: directResponse.status,
          ok: directResponse.ok,
          headers: Object.fromEntries(directResponse.headers.entries()),
          response: directData
        }
      });

      if (directResponse.ok && Array.isArray(directData)) {
        const productCount = directData.length;
        const isTargetMet = productCount === 42;
        
        // Log the critical verification to console
        console.log(`🎯 CRITICAL VERIFICATION: products.length === ${productCount}`);
        console.log(`✅ Expected: 42, Actual: ${productCount}`);
        console.log(`📋 Products:`, directData);
        
        addResult({
          test: `Product Count Verification - ${isTargetMet ? 'SUCCESS: 42 Products!' : 'Partial Data'}`,
          status: isTargetMet ? 'success' : productCount > 0 ? 'info' : 'error',
          message: `Found ${productCount} products ${isTargetMet ? '✅ TARGET MET!' : productCount > 0 ? '(Partial)' : '❌ Empty'}`,
          data: { 
            count: productCount, 
            expected: 42,
            targetMet: isTargetMet,
            sample: directData[0] 
          }
        });
      }

    } catch (fetchError) {
      const error = fetchError as Error;
      addResult({
        test: 'Direct Console Fetch',
        status: 'error',
        message: `Fetch failed: ${error.message}`,
        data: {
          errorName: error.name,
          errorMessage: error.message,
          isCorsError: error.name === 'TypeError' && error.message === 'Failed to fetch'
        }
      });
    }

    // Test 3: Network Tab Analysis
    addResult({
      test: 'Network Tab Instructions',
      status: 'info',
      message: 'Check Network tab in DevTools for request details. Look for Response and Preview tabs.'
    });

    // Test 4: Alternative Endpoints
    const endpoints = [
      'https://staffportal.replit.app/api/lenders',
      'https://staffportal.replit.app/api/products',
      'https://staff.replit.app/api/public/lenders'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        const text = await response.text();
        
        addResult({
          test: `Alternative Endpoint: ${endpoint}`,
          status: response.ok ? 'success' : 'error',
          message: `${response.status} ${response.statusText}`,
          data: {
            status: response.status,
            response: text.slice(0, 200) + (text.length > 200 ? '...' : '')
          }
        });
      } catch (error) {
        addResult({
          test: `Alternative Endpoint: ${endpoint}`,
          status: 'error',
          message: `Failed: ${(error as Error).message}`
        });
      }
    }

    setIsRunning(false);
  };

  const runManualSync = async () => {
    setIsRunning(true);
    addResult({
      test: 'Manual Sync Trigger',
      status: 'info',
      message: 'Starting manual sync with staff API...'
    });

    try {
      // LEGACY SYNC DISABLED - Using new IndexedDB caching system
      // const result = await scheduledSyncService.manualSync();
      
      addResult({
        test: 'Manual Sync Result',
        status: result.success ? 'success' : 'error',
        message: result.message,
        data: {
          productCount: result.productCount,
          success: result.success
        }
      });

      // Refresh local status
      const status = await syncManager.getSyncStatus();
      const products = await syncManager.getProducts();
      setSyncStatus(status);
      setLocalProducts(products);

    } catch (error) {
      addResult({
        test: 'Manual Sync Result',
        status: 'error',
        message: `Manual sync failed: ${(error as Error).message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="text-2xl font-bold">API Diagnostic Tool</CardTitle>
            <p className="text-blue-100">Testing Staff API directly as requested</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4 flex-wrap">
                <Button 
                  onClick={runDiagnostics} 
                  disabled={isRunning}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
                </Button>
                
                <Button 
                  onClick={runManualSync} 
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRunning ? 'Syncing...' : 'Manual Sync'}
                </Button>

                {syncStatus && (
                  <div className="text-sm text-gray-600">
                    <strong>Local DB:</strong> {syncStatus.productCount} products
                    {syncStatus.lastSyncTime > 0 && (
                      <span className="ml-2 text-xs">
                        Last: {new Date(syncStatus.lastSyncTime).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-yellow-800 font-semibold">Console Command Test</h3>
                <p className="text-yellow-700 text-sm mb-2">
                  Open DevTools Console and run this command manually:
                </p>
                <code className="block bg-gray-800 text-green-400 p-2 rounded text-sm">
                  fetch('https://staffportal.replit.app/api/public/lenders').then(r =&gt; r.json()).then(console.log).catch(console.error);
                </code>
              </div>

              {results.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Diagnostic Results</h3>
                  {results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-4 ${
                        result.status === 'success' ? 'bg-green-50 border-green-200' :
                        result.status === 'error' ? 'bg-red-50 border-red-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-semibold ${
                          result.status === 'success' ? 'text-green-800' :
                          result.status === 'error' ? 'text-red-800' :
                          'text-blue-800'
                        }`}>
                          {result.test}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.status === 'success' ? 'bg-green-100 text-green-800' :
                          result.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {result.status.toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        result.status === 'success' ? 'text-green-700' :
                        result.status === 'error' ? 'text-red-700' :
                        'text-blue-700'
                      }`}>
                        {result.message}
                      </p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-600">
                            View Details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-gray-800 font-semibold mb-2">Next Steps</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check Network tab in DevTools for request/response details</li>
                  <li>• Verify CORS headers in Response tab</li>
                  <li>• Look for any console errors or warnings</li>
                  <li>• Confirm staff backend deployment status</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
*/