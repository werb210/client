import { fetchProducts } from "../api/products";
/**
 * CLIENT VERIFICATION DIAGNOSTIC PAGE
 * Tests IndexedDB caching, sync behavior, and Step 2/5 access patterns
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { get, set } from 'idb-keyval';

interface TestResult {
  name: string;
  status: 'running' | 'passed' | 'failed' | 'pending';
  message: string;
  details?: any;
}

export default function ClientVerificationDiagnostic() {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Cache Verification', status: 'pending', message: 'Not run yet' },
    { name: 'Sync Trigger', status: 'pending', message: 'Not run yet' },
    { name: 'Step 2 Logic', status: 'pending', message: 'Not run yet' },
    { name: 'Step 5 Logic', status: 'pending', message: 'Not run yet' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const updateTestResult = (index: number, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ));
  };

  // Test 1: Verify Cached Product Retrieval
  const test1_VerifyCache = async () => { /* ensure products fetched */ 
    addLog('🔍 Starting Test 1: Verify Cached Product Retrieval');
    updateTestResult(0, 'running', 'Checking IndexedDB cache...');
    
    try {
      const data = await get('lender_products_cache');
      addLog(`🗂️ Cached lender products: ${data?.length || 0} products`);
      
      if (data && data.length > 0) {
        addLog(`✅ Sample products: ${JSON.stringify(data.slice(0, 2), null, 2)}`);
        const passed = data.length >= 41;
        updateTestResult(0, passed ? 'passed' : 'failed', 
          `Found ${data.length} products (Expected: ≥41)`, 
          { count: data.length, samples: data.slice(0, 2) }
        );
        return passed;
      } else {
        addLog('❌ Cache is empty or undefined - sync failed');
        updateTestResult(0, 'failed', 'Cache is empty or undefined - sync failed');
        return false;
      }
    } catch (error) {
      addLog(`❌ Test 1 failed: ${error.message}`);
      updateTestResult(0, 'failed', `Error: ${error.message}`);
      return false;
    }
  };

  // Test 2: Trigger Sync and Show Logs
  const test2_TriggerSync = async () => {
    addLog('🔄 Starting Test 2: Trigger Sync and Show Logs');
    updateTestResult(1, 'running', 'Attempting to sync with staff API...');
    
    try {
      const response = await /* rewired */
      
      if (!response.ok) {
        addLog(`❌ Staff API not available: ${response.status} ${response.statusText}`);
        const errorData = await response.json();
        addLog(`❌ Error details: ${JSON.stringify(errorData)}`);
        updateTestResult(1, 'failed', 
          `Staff API error: ${response.status} ${response.statusText}`, 
          errorData
        );
        return false;
      }
      
      const data = await response.json();
      addLog(`✅ Staff API response: ${JSON.stringify(data, null, 2)}`);
      
      if (data.success && data.products) {
        addLog(`✅ Fetched ${data.products.length} products from staff API`);
        
        // Try to save to IndexedDB
        await set('lender_products_cache', data.products);
        addLog('✅ Saved to IndexedDB');
        
        updateTestResult(1, 'passed', 
          `Successfully synced ${data.products.length} products`, 
          { count: data.products.length }
        );
        return true;
      } else {
        addLog('❌ Invalid API response format');
        updateTestResult(1, 'failed', 'Invalid API response format', data);
        return false;
      }
    } catch (error) {
      addLog(`❌ Test 2 failed: ${error.message}`);
      updateTestResult(1, 'failed', `Error: ${error.message}`);
      return false;
    }
  };

  // Test 3: Step 2 Logic Test
  const test3_Step2Logic = async () => {
    addLog('📦 Starting Test 3: Step 2 Logic Test - Category Selection');
    updateTestResult(2, 'running', 'Testing product filtering logic...');
    
    try {
      const cachedProducts = await get('lender_products_cache');
      
      if (!cachedProducts || cachedProducts.length === 0) {
        addLog('❌ No cached products available for Step 2 test');
        updateTestResult(2, 'failed', 'No cached products available');
        return false;
      }
      
      // Filter for factoring products
      const category = 'Invoice Factoring';
      const businessLocation = 'CA';
      const fundingAmount = 200000;
      
      const filteredProducts = cachedProducts.filter(product => {
        const categoryMatch = product.category === category || 
                            product.category === 'Factoring' ||
                            product.category === 'invoice_factoring';
        
        const locationMatch = product.country === businessLocation || 
                             product.country === 'CA' ||
                             product.offeredInCanada === true;
        
        const amountMatch = product.minAmountUsd <= fundingAmount && 
                           product.maxAmountUsd >= fundingAmount;
        
        return categoryMatch && locationMatch && amountMatch;
      });
      
      addLog(`📦 Recommended Products for ${category}: ${filteredProducts.length}`);
      addLog(`✅ Sample products: ${JSON.stringify(filteredProducts.slice(0, 2), null, 2)}`);
      
      const passed = filteredProducts.length > 0;
      updateTestResult(2, passed ? 'passed' : 'failed', 
        `Found ${filteredProducts.length} matching products`, 
        { 
          category, 
          businessLocation, 
          fundingAmount,
          matchedProducts: filteredProducts.length,
          samples: filteredProducts.slice(0, 2)
        }
      );
      
      return passed;
    } catch (error) {
      addLog(`❌ Test 3 failed: ${error.message}`);
      updateTestResult(2, 'failed', `Error: ${error.message}`);
      return false;
    }
  };

  // Test 4: Step 5 Logic Test
  const test4_Step5Logic = async () => {
    addLog('📄 Starting Test 4: Step 5 Logic Test - Document Deduplication');
    updateTestResult(3, 'running', 'Testing document requirements logic...');
    
    try {
      const cachedProducts = await get('lender_products_cache');
      
      if (!cachedProducts || cachedProducts.length === 0) {
        addLog('❌ No cached products available for Step 5 test');
        updateTestResult(3, 'failed', 'No cached products available');
        return false;
      }
      
      // Filter factoring products
      const factoringProducts = cachedProducts.filter(product => 
        product.category === 'Invoice Factoring' || 
        product.category === 'Factoring' ||
        product.category === 'invoice_factoring'
      );
      
      addLog(`📄 Factoring products found: ${factoringProducts.length}`);
      
      // Extract and deduplicate documents
      const allDocuments = new Set();
      factoringProducts.forEach(product => {
        if (product.requiredDocuments && Array.isArray(product.requiredDocuments)) {
          product.requiredDocuments.forEach(doc => allDocuments.add(doc));
        }
      });
      
      const deduplicatedDocs = Array.from(allDocuments);
      addLog(`📄 Required Documents (deduplicated): ${deduplicatedDocs.length}`);
      addLog(`✅ Document list: ${JSON.stringify(deduplicatedDocs, null, 2)}`);
      
      const passed = deduplicatedDocs.length > 0;
      updateTestResult(3, passed ? 'passed' : 'failed', 
        `Found ${deduplicatedDocs.length} unique documents`, 
        { 
          factoringProducts: factoringProducts.length,
          uniqueDocuments: deduplicatedDocs.length,
          documents: deduplicatedDocs
        }
      );
      
      return passed;
    } catch (error) {
      addLog(`❌ Test 4 failed: ${error.message}`);
      updateTestResult(3, 'failed', `Error: ${error.message}`);
      return false;
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setLogs([]);
    
    addLog('🚀 Starting Client Verification Diagnostic');
    addLog('='.repeat(50));
    
    const results = {
      test1: await test1_VerifyCache(),
      test2: await test2_TriggerSync(), 
      test3: await test3_Step2Logic(),
      test4: await test4_Step5Logic()
    };
    
    addLog('='.repeat(50));
    addLog('📊 DIAGNOSTIC RESULTS:');
    addLog(`✅ Test 1 - Cache Verification: ${results.test1 ? 'PASS' : 'FAIL'}`);
    addLog(`✅ Test 2 - Sync Trigger: ${results.test2 ? 'PASS' : 'FAIL'}`);
    addLog(`✅ Test 3 - Step 2 Logic: ${results.test3 ? 'PASS' : 'FAIL'}`);
    addLog(`✅ Test 4 - Step 5 Logic: ${results.test4 ? 'PASS' : 'FAIL'}`);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    addLog(`🎯 OVERALL SCORE: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      addLog('🎉 ALL TESTS PASSED - Client application ready!');
      toast({
        title: "All Tests Passed!",
        description: "Client application is ready for production",
        variant: "default"
      });
    } else {
      addLog('⚠️ SOME TESTS FAILED - Check staff API endpoint implementation');
      toast({
        title: "Some Tests Failed",
        description: "Check staff API endpoint implementation",
        variant: "destructive"
      });
    }
    
    setIsRunning(false);
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-500">PASSED</Badge>;
      case 'failed': return <Badge variant="destructive">FAILED</Badge>;
      case 'running': return <Badge variant="secondary">RUNNING</Badge>;
      default: return <Badge variant="outline">PENDING</Badge>;
    }
  };

  const products = await (await getRecommendedProducts()).matches;
return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Client Verification Diagnostic</h1>
        <p className="text-muted-foreground">
          Tests IndexedDB caching, sync behavior, and Step 2/5 access patterns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Test Results
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="ml-4"
              >
                {isRunning ? 'Running...' : 'Run All Tests'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-muted-foreground">{test.message}</div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>API Base URL: <code>/api</code></div>
              <div>Staff API: <code>https://staffportal.replit.app/api</code></div>
              <div>Cache Key: <code>lender_products_cache</code></div>
              <div>Expected Products: <code>≥41</code></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="text-sm">
              {logs.length > 0 ? logs.join('\n') : 'No logs yet. Click "Run All Tests" to start.'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}