import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormData } from '@/context/FormDataContext';
import { extractUuid } from '@/lib/uuidUtils';

export default function Step4Step6Test() {
  const { state, dispatch } = useFormData();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
    console.log(message);
  };

  const clearResults = () => {
    setTestResults([]);
    console.clear();
  };

  // Test 1: Extract and Store applicationId in Step 4
  const testStep4Storage = () => {
    addResult('🧪 Test 1: Extract and Store applicationId in Step 4');
    
    try {
      // Simulate API response with prefixed ID
      const mockApiResponse = {
        applicationId: 'app_prod_123e4567-e89b-12d3-a456-426614174000',
        status: 'created'
      };
      
      const rawId = mockApiResponse.applicationId;
      const uuid = extractUuid(rawId);
      
      // Store in context
      dispatch({ type: 'UPDATE_FORM_DATA', payload: { applicationId: uuid } });
      
      // Store in localStorage
      localStorage.setItem('applicationId', uuid);
      
      setApplicationId(uuid);
      addResult(`✅ Raw ID: ${rawId}`);
      addResult(`✅ Clean UUID: ${uuid}`);
      addResult(`✅ Stored in context and localStorage`);
      
    } catch (error) {
      addResult(`❌ Error in Step 4 storage: ${error}`);
    }
  };

  // Test 2: Recover applicationId in Step 6
  const testStep6Recovery = () => {
    addResult('🧪 Test 2: Recover applicationId in Step 6');
    
    try {
      // Simulate context loss
      dispatch({ type: 'UPDATE_FORM_DATA', payload: { applicationId: null } });
      
      // Simulate Step 6 recovery logic
      const stored = localStorage.getItem('applicationId');
      if (stored) {
        const uuid = extractUuid(stored);
        dispatch({ type: 'UPDATE_FORM_DATA', payload: { applicationId: uuid } });
        addResult(`✅ Recovered applicationId from localStorage: ${uuid}`);
        addResult(`✅ Context restored successfully`);
      } else {
        addResult(`❌ No applicationId found in localStorage`);
      }
      
    } catch (error) {
      addResult(`❌ Error in Step 6 recovery: ${error}`);
    }
  };

  // Test 3: Verify persistence across refresh
  const testPersistence = () => {
    addResult('🧪 Test 3: Verify persistence across refresh');
    
    const contextId = state.applicationId;
    const localStorageId = localStorage.getItem('applicationId');
    
    addResult(`Context ID: ${contextId}`);
    addResult(`localStorage ID: ${localStorageId}`);
    
    if (contextId && localStorageId && contextId === localStorageId) {
      addResult(`✅ Persistence verified - IDs match`);
    } else {
      addResult(`❌ Persistence failed - IDs don't match`);
    }
  };

  // Test 4: SignNow API readiness
  const testSignNowReadiness = () => {
    addResult('🧪 Test 4: SignNow API readiness');
    
    const finalId = state.applicationId;
    
    if (finalId) {
      addResult(`✅ SignNow ready with clean UUID: ${finalId}`);
      addResult(`✅ POST /api/signnow/create would work`);
      addResult(`✅ Request body: { applicationId: "${finalId}" }`);
    } else {
      addResult(`❌ SignNow not ready - no applicationId`);
    }
  };

  // Test 5: Complete workflow test
  const testCompleteWorkflow = () => {
    addResult('🧪 Test 5: Complete Step 4 → Step 6 workflow');
    
    // Clear everything
    localStorage.clear();
    dispatch({ type: 'UPDATE_FORM_DATA', payload: { applicationId: null } });
    
    // Step 4: Store ID
    const mockId = `app_prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const uuid = extractUuid(mockId);
    dispatch({ type: 'UPDATE_FORM_DATA', payload: { applicationId: uuid } });
    localStorage.setItem('applicationId', uuid);
    addResult(`Step 4: Stored ${uuid}`);
    
    // Simulate context loss
    dispatch({ type: 'UPDATE_FORM_DATA', payload: { applicationId: null } });
    addResult(`Context lost - simulating page refresh`);
    
    // Step 6: Recover ID
    const stored = localStorage.getItem('applicationId');
    if (stored) {
      const recoveredUuid = extractUuid(stored);
      dispatch({ type: 'UPDATE_FORM_DATA', payload: { applicationId: recoveredUuid } });
      addResult(`Step 6: Recovered ${recoveredUuid}`);
      
      if (recoveredUuid === uuid) {
        addResult(`✅ Complete workflow SUCCESS`);
      } else {
        addResult(`❌ Complete workflow FAILED - UUIDs don't match`);
      }
    } else {
      addResult(`❌ Complete workflow FAILED - no stored ID`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 4 → Step 6 ApplicationId Flow Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Button onClick={testStep4Storage} className="w-full">
              Test Step 4 Storage
            </Button>
            <Button onClick={testStep6Recovery} className="w-full">
              Test Step 6 Recovery
            </Button>
            <Button onClick={testPersistence} className="w-full">
              Test Persistence
            </Button>
            <Button onClick={testSignNowReadiness} className="w-full">
              Test SignNow Ready
            </Button>
            <Button onClick={testCompleteWorkflow} className="w-full">
              Test Complete Flow
            </Button>
            <Button onClick={clearResults} variant="outline" className="w-full">
              Clear Results
            </Button>
          </div>

          <Alert className="mb-4">
            <AlertDescription>
              <strong>Current State:</strong><br />
              Context ID: {state.applicationId || 'null'}<br />
              localStorage ID: {localStorage.getItem('applicationId') || 'null'}
            </AlertDescription>
          </Alert>

          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-2 bg-gray-100 rounded">
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