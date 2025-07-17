import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DocumentUploadWidget } from '@/components/upload/DocumentUploadWidget';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff, Network, FileText, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface TestResult {
  test: string;
  step: string;
  expected: string;
  actual: string;
  passed: boolean;
  timestamp: string;
}

export default function DocumentUploadTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testApplicationId] = useState('test-' + crypto.randomUUID());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [uploadCount, setUploadCount] = useState(0);
  const { toast } = useToast();

  const addTestResult = (test: string, step: string, expected: string, actual: string, passed: boolean) => {
    const result: TestResult = {
      test,
      step,
      expected,
      actual,
      passed,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    
    console.log(`🧪 [TEST] ${test} - ${step}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual: ${actual}`);
  };

  const clearResults = () => {
    setTestResults([]);
    setUploadCount(0);
  };

  const handleUploadSuccess = (file: File, documentId: string) => {
    setUploadCount(prev => prev + 1);
    addTestResult(
      'Upload Valid PDF',
      'Client drag/drop',
      'Shows green ✅, document appears in staff',
      `File: ${file.name}, Document ID: ${documentId}`,
      true
    );
  };

  const handleUploadError = (file: File, error: string) => {
    const isNetworkError = error.includes('Failed to fetch') || 
                           error.includes('NetworkError') || 
                           error.includes('network');
    
    addTestResult(
      'Upload w/ Network Drop',
      'Network error',
      'Shows red ❌ toast, no DB record',
      `File: ${file.name}, Error: ${error}`,
      isNetworkError
    );
  };

  const simulateOfflineMode = () => {
    setIsOnline(false);
    toast({
      title: "Network simulation",
      description: "Simulating airplane mode - next upload will fail",
      variant: "default"
    });
    
    // Temporarily override navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    
    // Restore after 10 seconds
    setTimeout(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      setIsOnline(true);
      toast({
        title: "Network restored",
        description: "Network connection restored",
        variant: "default"
      });
    }, 10000);
  };

  const openNetworkThrottling = () => {
    toast({
      title: "DevTools Instructions",
      description: "Open DevTools > Network tab > Throttle to 'Slow 3G'",
      variant: "default"
    });
    
    console.log(`
🧪 NETWORK THROTTLING TEST INSTRUCTIONS:
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Click on throttling dropdown (usually says "No throttling")
4. Select "Slow 3G"
5. Try uploading a file now
6. Expected: Upload takes longer, shows progress spinner
    `);
  };

  const generateLargePDF = () => {
    // Create a large blob (~5MB) to test file size limits
    const size = 5 * 1024 * 1024; // 5MB
    const largeContent = new Array(size).fill('A').join('');
    const blob = new Blob([largeContent], { type: 'application/pdf' });
    const file = new File([blob], 'large-test-document.pdf', { type: 'application/pdf' });
    
    toast({
      title: "Large PDF Generated",
      description: `Created ${(file.size / 1024 / 1024).toFixed(2)}MB test file`,
      variant: "default"
    });
    
    return file;
  };

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Document Upload Widget Test Suite</h1>
        <p className="text-gray-600">
          Test the enhanced DocumentUploadWidget with network failure simulation and upload validation
        </p>
      </div>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Test Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={simulateOfflineMode} 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <WifiOff className="h-4 w-4" />
              <span>Simulate Airplane Mode</span>
            </Button>
            
            <Button 
              onClick={openNetworkThrottling}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Network className="h-4 w-4" />
              <span>Enable Network Throttling</span>
            </Button>
            
            <Button 
              onClick={generateLargePDF}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Generate Large PDF (~5MB)</span>
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
              
              <Badge variant="outline">
                Application ID: {testApplicationId}
              </Badge>
              
              <Badge variant="outline">
                Uploads: {uploadCount}
              </Badge>
            </div>
            
            <Button onClick={clearResults} variant="ghost" size="sm">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Test Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Bank Statements Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentUploadWidget
              applicationId={testApplicationId}
              documentType="bank_statements"
              category="Bank Statements"
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              maxFiles={6}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Financial Statements Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentUploadWidget
              applicationId={testApplicationId}
              documentType="financial_statements"
              category="Financial Statements"
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              maxFiles={3}
            />
          </CardContent>
        </Card>
      </div>

      {/* Test Plan */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🧪 Final Testing Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="font-medium">Test</div>
              <div className="font-medium">Step</div>
              <div className="font-medium">Expected Result</div>
              <div className="font-medium">Status</div>
            </div>
            
            <Separator />
            
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Upload Valid PDF</span>
                </div>
                <div>Client drag/drop</div>
                <div>Shows green ✅, document appears in staff</div>
                <Badge variant="outline">Ready to test</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Upload w/ Network Drop</span>
                </div>
                <div>Kill Wi-Fi mid-upload</div>
                <div>Shows red ❌ toast, no DB record</div>
                <Badge variant="outline">Use airplane mode button</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Retry Upload</span>
                </div>
                <div>Re-upload same doc</div>
                <div>Successful on retry</div>
                <Badge variant="outline">Click retry button</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Document in Staff View</span>
                </div>
                <div>Visit app ID in Staff</div>
                <div>Files appear with preview/download</div>
                <Badge variant="outline">Manual verification</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Results</span>
              <Badge variant={passedTests === totalTests ? "default" : "destructive"}>
                {passedTests}/{totalTests} Passed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                  {result.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{result.test}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.timestamp}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{result.step}</p>
                    <p className="text-sm">
                      <span className="font-medium">Expected:</span> {result.expected}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Actual:</span> {result.actual}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}