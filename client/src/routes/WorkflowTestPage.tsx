import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 as CheckCircle, XCircle, Upload, FileText, Play, RotateCcw } from 'lucide-react';

interface TestResult {
  success: boolean;
  applicationId?: string;
  uploadedDocuments?: number;
  totalDocuments?: number;
  error?: string;
}

const WorkflowTestPage: React.FC = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runCompleteWorkflow = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('Starting complete workflow test...');

    try {
      // Import the test script dynamically
      const script = document.createElement('script');
      script.src = '/test-complete-workflow.js';
      document.head.appendChild(script);

      // Wait for script to load and run test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (window.testCompleteWorkflow) {
        addLog('Running Step 1-7 workflow test...');
        const result = await window.testCompleteWorkflow();
        setTestResult(result);
        
        if (result.success) {
          addLog(`✅ Workflow completed successfully`);
          addLog(`🔑 Application ID: ${result.applicationId}`);
          addLog(`📄 Documents: ${result.uploadedDocuments}/${result.totalDocuments} uploaded`);
        } else {
          addLog(`❌ Workflow failed: ${result.error}`);
        }
      } else {
        throw new Error('Test script not loaded');
      }

    } catch (error) {
      addLog(`❌ Test failed: ${error.message}`);
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const test409Handling = async () => {
    setIsRunning(true);
    addLog('Testing 409 duplicate handling...');

    try {
      // Load 409 test script
      const script = document.createElement('script');
      script.src = '/test-409-duplicate-handling.js';
      document.head.appendChild(script);

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (window.test409DuplicateHandling) {
        addLog('Running duplicate detection test...');
        await window.test409DuplicateHandling();
        addLog('✅ 409 test completed - check browser console for details');
      }

    } catch (error) {
      addLog(`❌ 409 test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testUploadRetry = async () => {
    if (!testResult?.applicationId) {
      addLog('❌ No application ID available for retry test');
      return;
    }

    setIsRunning(true);
    addLog('Testing upload retry functionality...');

    try {
      if (window.testUploadRetry) {
        await window.testUploadRetry(testResult.applicationId);
        addLog('✅ Retry test completed');
      }
    } catch (error) {
      addLog(`❌ Retry test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Complete Workflow Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={runCompleteWorkflow} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Run Complete Workflow
            </Button>
            
            <Button 
              onClick={test409Handling} 
              disabled={isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Test 409 Handling
            </Button>
            
            <Button 
              onClick={testUploadRetry} 
              disabled={isRunning || !testResult?.applicationId}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Test Upload Retry
            </Button>
          </div>

          {isRunning && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>Running tests...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? "PASS" : "FAIL"}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">Overall Status</p>
              </div>
              
              {testResult.applicationId && (
                <div className="text-center">
                  <Badge variant="secondary">
                    {testResult.applicationId.substring(0, 8)}...
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">Application ID</p>
                </div>
              )}
              
              {testResult.uploadedDocuments !== undefined && (
                <div className="text-center">
                  <Badge variant={testResult.uploadedDocuments === testResult.totalDocuments ? "default" : "destructive"}>
                    {testResult.uploadedDocuments}/{testResult.totalDocuments}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">Documents Uploaded</p>
                </div>
              )}
              
              {testResult.error && (
                <div className="text-center">
                  <Badge variant="destructive">ERROR</Badge>
                  <p className="text-sm text-gray-600 mt-1">Error Occurred</p>
                </div>
              )}
            </div>

            {testResult.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{testResult.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Run a test to see output.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health Check Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Required Tests:</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Step 1-7 Complete Workflow
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Multiple Document Uploads
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  409 Duplicate Handling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Upload Retry Support
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Expected Results:</h4>
              <ul className="space-y-1 text-sm">
                <li>✅ All uploads show success status</li>
                <li>✅ Documents appear in correct categories</li>
                <li>✅ No "missing" warnings displayed</li>
                <li>✅ Staff backend receives all files</li>
                <li>✅ Documents are viewable/downloadable</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowTestPage;