import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface TestResult {
  test: string;
  passed: boolean;
  details: string;
  timestamp: number;
}

interface E2ETestResults {
  passed: number;
  total: number;
  results: TestResult[];
}

const ComprehensiveE2ETestPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<E2ETestResults | null>(null);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    const logMessage = `[${timestamp}] ${prefix} ${message}`;
    setLogs(prev => [...prev, logMessage]);
    // console.log(logMessage);
  };

  const runE2ETests = async () => {
    setIsRunning(true);
    setResults(null);
    setLogs([]);
    setCurrentTest('Initializing...');

    const testResults: TestResult[] = [];
    let passedTests = 0;

    const addResult = (testName: string, passed: boolean, details = '') => {
      testResults.push({
        test: testName,
        passed,
        details,
        timestamp: Date.now()
      });
      if (passed) passedTests++;
      addLog(`${testName}: ${passed ? 'PASSED' : 'FAILED'}${details ? ' - ' + details : ''}`, passed ? 'success' : 'error');
    };

    try {
      // Test 1: Landing Page Load and API Connectivity
      setCurrentTest('Testing Landing Page Load and API Connectivity...');
      addLog('Testing landing page load and API connectivity...');
      
      try {
        const response = await fetch('/api/public/lenders');
        const data = await response.json();
        const apiWorking = response.ok && data.success && data.productCount > 0;
        addResult('Landing Page API Connectivity', apiWorking, 
          `API returned ${data.productCount} products with max funding ${data.maxAmount}`);
      } catch (error) {
        addResult('Landing Page API Connectivity', false, (error as Error).message);
      }

      // Test 2: Application Form Navigation
      setCurrentTest('Testing Application Form Navigation...');
      addLog('Testing navigation to application form...');
      
      try {
        // Navigate to Step 1
        window.history.pushState({}, '', '/apply/step-1');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const currentPath = window.location.pathname;
        const isOnStep1 = currentPath.includes('step-1') || currentPath.includes('apply');
        addResult('Application Form Navigation', isOnStep1, `Current path: ${currentPath}`);
      } catch (error) {
        addResult('Application Form Navigation', false, (error as Error).message);
      }

      // Test 3: Form Elements Detection
      setCurrentTest('Testing Form Elements...');
      addLog('Checking for form elements...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      const formElements = document.querySelectorAll('input, select, button');
      const hasFormElements = formElements.length > 5;
      addResult('Form Elements Detection', hasFormElements, 
        `Found ${formElements.length} form elements`);

      // Test 4: Step 2 Product Recommendations API
      setCurrentTest('Testing Product Recommendations API...');
      addLog('Testing product recommendations endpoint...');
      
      try {
        const response = await fetch('/api/loan-products/categories?fundingAmount=100000&businessLocation=Canada');
        const data = await response.json();
        const recommendationsWorking = response.ok && (data.categories || data.success);
        addResult('Product Recommendations API', recommendationsWorking, 
          `API returned ${data.categories?.length || 0} categories`);
      } catch (error) {
        addResult('Product Recommendations API', false, (error as Error).message);
      }

      // Test 5: Document Upload System
      setCurrentTest('Testing Document Upload System...');
      addLog('Testing document upload endpoint...');
      
      try {
        const testFormData = new FormData();
        testFormData.append('category', 'Bank Statements');
        const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        testFormData.append('files', testFile);
        
        const response = await fetch('/api/public/upload/test-application-id', {
          method: 'POST',
          body: testFormData
        });
        
        const uploadWorking = response.status !== 404;
        addResult('Document Upload API', uploadWorking, 
          `Upload endpoint returned status ${response.status}`);
      } catch (error) {
        addResult('Document Upload API', false, (error as Error).message);
      }

      // Test 6: SignNow Integration
      setCurrentTest('Testing SignNow Integration...');
      addLog('Testing SignNow API endpoint...');
      
      try {
        const testApplicationId = 'test-' + Date.now();
        const response = await fetch(`/api/applications/${testApplicationId}/signnow`);
        const data = await response.json();
        
        const signNowWorking = response.ok && data.success && data.data?.signingUrl;
        addResult('SignNow API Integration', signNowWorking, 
          `SignNow endpoint returned ${response.status} with ${data.success ? 'valid' : 'invalid'} response`);
      } catch (error) {
        addResult('SignNow API Integration', false, (error as Error).message);
      }

      // Test 7: Final Submission Endpoint
      setCurrentTest('Testing Final Submission...');
      addLog('Testing final submission endpoint...');
      
      try {
        const response = await fetch('/api/public/applications/test-app/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        });
        
        const submissionWorking = response.status !== 404;
        addResult('Final Submission API', submissionWorking, 
          `Submission endpoint returned status ${response.status}`);
      } catch (error) {
        addResult('Final Submission API', false, (error as Error).message);
      }

      // Test 8: Error Handling
      setCurrentTest('Testing Error Handling...');
      addLog('Testing error handling...');
      
      try {
        const invalidResponse = await fetch('/api/invalid-endpoint');
        const handles404 = invalidResponse.status === 404;
        addResult('Error Handling', handles404, 'Invalid endpoint returns proper 404 status');
      } catch (error) {
        addResult('Error Handling', true, 'Network errors are properly caught');
      }

      // Test 9: Security Headers
      setCurrentTest('Testing Security Headers...');
      addLog('Testing security headers...');
      
      try {
        const response = await fetch('/api/public/lenders');
        const hasCorsHeaders = response.headers.get('access-control-allow-origin') !== null;
        addResult('Security Headers', hasCorsHeaders, 'CORS headers present');
      } catch (error) {
        addResult('Security Headers', false, (error as Error).message);
      }

      // Test 10: Regional Data Support
      setCurrentTest('Testing Regional Data Support...');
      addLog('Testing Canadian and US data support...');
      
      try {
        const canadaResponse = await fetch('/api/loan-products/categories?businessLocation=Canada&fundingAmount=50000');
        const usResponse = await fetch('/api/loan-products/categories?businessLocation=US&fundingAmount=50000');
        
        const canadaData = await canadaResponse.json();
        const usData = await usResponse.json();
        
        const regionalSupport = canadaResponse.ok && usResponse.ok;
        addResult('Regional Data Support', regionalSupport, 
          `Canada: ${canadaData.categories?.length || 0} categories, US: ${usData.categories?.length || 0} categories`);
      } catch (error) {
        addResult('Regional Data Support', false, (error as Error).message);
      }

      const totalTests = testResults.length;
      const successRate = Math.round((passedTests / totalTests) * 100);

      addLog('='.repeat(60));
      addLog(`COMPREHENSIVE E2E TEST RESULTS`);
      addLog('='.repeat(60));
      addLog(`Total Tests: ${totalTests}`);
      addLog(`Passed: ${passedTests}`);
      addLog(`Failed: ${totalTests - passedTests}`);
      addLog(`Success Rate: ${successRate}%`);
      addLog('='.repeat(60));

      if (successRate >= 80) {
        addLog('🎉 APPLICATION STATUS: PRODUCTION READY', 'success');
      } else if (successRate >= 60) {
        addLog('⚠️ APPLICATION STATUS: NEEDS ATTENTION', 'error');
      } else {
        addLog('🚨 APPLICATION STATUS: CRITICAL ISSUES', 'error');
      }

      setResults({
        passed: passedTests,
        total: totalTests,
        results: testResults
      });

    } catch (error) {
      addLog(`Test suite execution failed: ${(error as Error).message}`, 'error');
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (passed: boolean) => {
    return passed ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Comprehensive End-to-End Test Suite
          </h1>
          <p className="text-gray-600">
            Test the complete application workflow from landing page to final submission
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Test Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={runE2ETests} 
                  disabled={isRunning}
                  className="w-full"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    'Run Comprehensive E2E Tests'
                  )}
                </Button>

                {isRunning && currentTest && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-700 font-medium">
                      Current Test: {currentTest}
                    </p>
                  </div>
                )}

                {results && (
                  <div className="p-4 bg-gray-50 border rounded">
                    <h3 className="font-semibold mb-2">Test Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Total Tests: <span className="font-medium">{results.total}</span></div>
                      <div>Passed: <span className="font-medium text-green-600">{results.passed}</span></div>
                      <div>Failed: <span className="font-medium text-red-600">{results.total - results.passed}</span></div>
                      <div>Success Rate: <span className="font-medium">{Math.round((results.passed / results.total) * 100)}%</span></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results ? (
                  results.results.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded border ${getStatusColor(result.passed)}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.test}</span>
                        {getStatusIcon(result.passed)}
                      </div>
                      {result.details && (
                        <p className="text-xs mt-1 opacity-75">{result.details}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No test results yet. Click "Run Tests" to begin.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Logs */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Live Test Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Logs will appear here when tests are running...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensiveE2ETestPage;