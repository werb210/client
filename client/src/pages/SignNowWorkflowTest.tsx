import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export default function SignNowWorkflowTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [applicationId, setApplicationId] = useState<string>('');

  const updateResult = (name: string, status: 'success' | 'error', message?: string, data?: any) => {
    setTestResults(prev => prev.map(result => 
      result.name === name 
        ? { ...result, status, message, data }
        : result
    ));
  };

  const runSignNowWorkflowTest = async () => {
    setIsRunning(true);
    setTestResults([
      { name: 'Create Test Application', status: 'pending' },
      { name: 'Check Application Status', status: 'pending' },
      { name: 'Initiate Signing Process', status: 'pending' },
      { name: 'Check Signing Status', status: 'pending' },
      { name: 'Retrieve Signing URL', status: 'pending' }
    ]);

    let testAppId = '';

    try {
      // Step 1: Create Test Application
      console.log('🧪 Creating test application...');
      const testApplication = {
        businessName: 'SignNow Test Company LLC',
        fundingAmount: 75000,
        lookingFor: 'capital',
        businessLocation: 'US',
        industry: 'Technology',
        headquarters: 'US',
        salesHistory: '2-5yrs',
        averageMonthlyRevenue: 25000,
        accountsReceivableBalance: 10000,
        fixedAssetsValue: 50000
      };

      const createResponse = await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify(testApplication)
      });

      if (createResponse.ok) {
        const createData = await createResponse.json();
        testAppId = createData.id;
        setApplicationId(testAppId);
        updateResult('Create Test Application', 'success', `Created application: ${testAppId}`, createData);
        console.log('✅ Test application created:', testAppId);
      } else {
        const errorText = await createResponse.text();
        updateResult('Create Test Application', 'error', `Failed: ${createResponse.status} - ${errorText}`);
        setIsRunning(false);
        return;
      }

      // Step 2: Check Application Status
      console.log('🔍 Checking application status...');
      try {
        const statusResponse = await apiFetch(`/applications/${testAppId}`);
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          updateResult('Check Application Status', 'success', `Status: ${statusData.status}`, statusData);
          console.log('✅ Application status retrieved');
        } else {
          const errorText = await statusResponse.text();
          updateResult('Check Application Status', 'error', `Status check failed: ${statusResponse.status} - ${errorText}`);
        }
      } catch (error) {
        updateResult('Check Application Status', 'error', `Network error: ${error.message}`);
      }

      // Step 3: Initiate Signing Process
      console.log('🖊️ Initiating signing process...');
      try {
        const signingData = {
          businessName: testApplication.businessName,
          fundingAmount: testApplication.fundingAmount,
          applicantName: 'John Doe',
          businessAddress: '123 Test St, Test City, CA 90210'
        };

        const initiateResponse = await apiFetch(`/applications/${testAppId}/initiate-signing`, {
          method: 'POST',
          body: JSON.stringify(signingData)
        });

        if (initiateResponse.ok) {
          const initiateData = await initiateResponse.json();
          updateResult('Initiate Signing Process', 'success', 'Signing initiated successfully', initiateData);
          console.log('✅ Signing process initiated');
        } else {
          const errorText = await initiateResponse.text();
          updateResult('Initiate Signing Process', 'error', `Initiation failed: ${initiateResponse.status} - ${errorText}`);
        }
      } catch (error) {
        updateResult('Initiate Signing Process', 'error', `Network error: ${error.message}`);
      }

      // Step 4: Check Signing Status
      console.log('⏳ Checking signing status...');
      try {
        const signingStatusResponse = await apiFetch(`/applications/${testAppId}/signing-status`);
        
        if (signingStatusResponse.ok) {
          const signingStatusData = await signingStatusResponse.json();
          updateResult('Check Signing Status', 'success', `Status: ${signingStatusData.status || 'Unknown'}`, signingStatusData);
          console.log('✅ Signing status retrieved');
        } else {
          const errorText = await signingStatusResponse.text();
          updateResult('Check Signing Status', 'error', `Status check failed: ${signingStatusResponse.status} - ${errorText}`);
        }
      } catch (error) {
        updateResult('Check Signing Status', 'error', `Network error: ${error.message}`);
      }

      // Step 5: Retrieve Signing URL
      console.log('🔗 Retrieving signing URL...');
      try {
        const urlResponse = await apiFetch(`/applications/${testAppId}/signing-url`);
        
        if (urlResponse.ok) {
          const urlData = await urlResponse.json();
          updateResult('Retrieve Signing URL', 'success', 'URL retrieved successfully', urlData);
          console.log('✅ Signing URL retrieved');
        } else {
          const errorText = await urlResponse.text();
          updateResult('Retrieve Signing URL', 'error', `URL retrieval failed: ${urlResponse.status} - ${errorText}`);
        }
      } catch (error) {
        updateResult('Retrieve Signing URL', 'error', `Network error: ${error.message}`);
      }

    } catch (error) {
      console.error('❌ Test workflow failed:', error);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SignNow Workflow Test</h1>
          <p className="text-gray-600">Complete Step 6 workflow validation with real API endpoints</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🧪 SignNow API Integration Test</span>
              {isRunning && <Clock className="h-5 w-5 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={runSignNowWorkflowTest}
                  disabled={isRunning}
                  className="flex-1"
                >
                  {isRunning ? 'Running Tests...' : 'Run SignNow Workflow Test'}
                </Button>
              </div>

              {applicationId && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Test Application ID:</strong> {applicationId}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h3 className="font-medium">{result.name}</h3>
                          {result.message && (
                            <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    
                    {result.data && (
                      <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono overflow-x-auto">
                        <pre>{JSON.stringify(result.data, null, 2)}</pre>
                      </div>
                    )}
                    
                    {index < testResults.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Expected Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Application creation should return 201 with application ID</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Application status should return 200 with application details</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>Signing initiation may return 500 (backend implementation needed)</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>Signing status/URL may return 500 (backend implementation needed)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}