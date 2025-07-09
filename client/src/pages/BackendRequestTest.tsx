import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { extractUuid } from '@/lib/uuidUtils';

export default function BackendRequestTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
    console.log(message);
  };

  const clearResults = () => {
    setTestResults([]);
    setApplicationId(null);
    console.clear();
  };

  // Test 1: POST /applications
  const testPostApplications = async () => {
    addResult('🧪 Test 1: POST /applications');
    setIsLoading(true);
    
    const formData = {
      businessName: 'Test Business Corp',
      businessLocation: 'Canada',
      fundingAmount: 50000,
      lookingFor: 'working_capital',
      salesHistory: '1-2-years',
      lastYearRevenue: '100000-250000',
      averageMonthlyRevenue: '10000-25000',
      accountsReceivableBalance: '25000-50000',
      fixedAssetsValue: '50000-100000',
      stepCompleted: 4,
      submissionTimestamp: new Date().toISOString(),
      region: 'CA'
    };
    
    try {
      const response = await fetch('/api/public/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify(formData)
      });
      
      addResult(`Response status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        addResult('✅ POST /applications SUCCESS');
        addResult(`Response: ${JSON.stringify(result, null, 2)}`);
        
        const rawId = result.applicationId || result.id || result.uuid;
        if (rawId) {
          const uuid = extractUuid(rawId);
          setApplicationId(uuid);
          addResult(`Raw ID: ${rawId}`);
          addResult(`Clean UUID: ${uuid}`);
          addResult('✅ ApplicationId extracted and stored');
          
          toast({
            title: "Success",
            description: "Application created successfully",
          });
        } else {
          addResult('❌ No applicationId in response');
        }
      } else {
        const errorText = await response.text();
        addResult('❌ POST /applications FAILED');
        addResult(`Error: ${errorText}`);
        
        toast({
          title: "Error",
          description: "Failed to create application",
          variant: "destructive",
        });
      }
    } catch (error) {
      addResult(`❌ Network error: ${error}`);
      toast({
        title: "Network Error",
        description: "Failed to connect to backend",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test 2: POST /signnow/create
  const testSignNowCreate = async () => {
    if (!applicationId) {
      addResult('❌ No applicationId - run POST /applications first');
      return;
    }
    
    addResult('🧪 Test 2: POST /signnow/create');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/signnow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify({ applicationId })
      });
      
      addResult(`Response status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        addResult('✅ POST /signnow/create SUCCESS');
        addResult(`Response: ${JSON.stringify(result, null, 2)}`);
        
        toast({
          title: "Success",
          description: "SignNow document created successfully",
        });
      } else {
        const errorText = await response.text();
        addResult('❌ POST /signnow/create FAILED');
        addResult(`Error: ${errorText}`);
        
        toast({
          title: "Error",
          description: "Failed to create SignNow document",
          variant: "destructive",
        });
      }
    } catch (error) {
      addResult(`❌ Network error: ${error}`);
      toast({
        title: "Network Error",
        description: "Failed to connect to SignNow service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test 3: GET /signing-status
  const testSigningStatus = async () => {
    if (!applicationId) {
      addResult('❌ No applicationId - run POST /applications first');
      return;
    }
    
    addResult('🧪 Test 3: GET /signing-status');
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/public/applications/${applicationId}/signing-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        }
      });
      
      addResult(`Response status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        addResult('✅ GET /signing-status SUCCESS');
        addResult(`Response: ${JSON.stringify(result, null, 2)}`);
        
        if (result.signing_status === 'completed') {
          addResult('✅ Document signing completed');
        } else {
          addResult(`Current status: ${result.signing_status}`);
        }
        
        toast({
          title: "Success",
          description: "Signing status retrieved successfully",
        });
      } else {
        const errorText = await response.text();
        addResult('❌ GET /signing-status FAILED');
        addResult(`Error: ${errorText}`);
        
        toast({
          title: "Error",
          description: "Failed to get signing status",
          variant: "destructive",
        });
      }
    } catch (error) {
      addResult(`❌ Network error: ${error}`);
      toast({
        title: "Network Error",
        description: "Failed to connect to backend",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test 4: Complete workflow
  const testCompleteWorkflow = async () => {
    addResult('🧪 Test 4: Complete Step 4 → Step 6 workflow');
    
    // Step 1: Create application
    await testPostApplications();
    
    // Wait a moment for the application to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Create SignNow document
    if (applicationId) {
      await testSignNowCreate();
    }
    
    // Step 3: Check signing status
    if (applicationId) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await testSigningStatus();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Backend Request Test - Step 4 → Step 6 Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Button 
              onClick={testPostApplications} 
              disabled={isLoading}
              className="w-full"
            >
              Test POST /applications
            </Button>
            <Button 
              onClick={testSignNowCreate} 
              disabled={isLoading || !applicationId}
              className="w-full"
            >
              Test SignNow Create
            </Button>
            <Button 
              onClick={testSigningStatus} 
              disabled={isLoading || !applicationId}
              className="w-full"
            >
              Test Signing Status
            </Button>
            <Button 
              onClick={testCompleteWorkflow} 
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              Test Complete Flow
            </Button>
          </div>

          <div className="mb-4">
            <Button 
              onClick={clearResults} 
              variant="outline" 
              className="w-full"
            >
              Clear Results
            </Button>
          </div>

          <Alert className="mb-4">
            <AlertDescription>
              <strong>Current ApplicationId:</strong> {applicationId || 'none'}<br />
              <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}<br />
              <strong>Backend URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'default'}
            </AlertDescription>
          </Alert>

          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded ${
                        result.includes('✅') ? 'bg-green-100 text-green-800' :
                        result.includes('❌') ? 'bg-red-100 text-red-800' :
                        result.includes('🧪') ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100'
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}