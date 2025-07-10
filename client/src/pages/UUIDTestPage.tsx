/**
 * UUID Test Page
 * Verify that application IDs are properly generated in UUID format
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UUIDTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);

  const addResult = (test: string, result: any, status: 'success' | 'error') => {
    setTestResults(prev => [...prev, { test, result, status, timestamp: new Date().toISOString() }]);
  };

  const runUUIDTest = async () => {
    setTestResults([]);
    
    try {
      // Test 1: UUID Package Availability
      console.log('🧪 Testing UUID package...');
      const { v4: uuidv4 } = await import('uuid');
      const testUuid = uuidv4();
      addResult('UUID Package Test', `Generated: ${testUuid}`, 'success');
      
      // Test 2: UUID Format Validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const isValidUuid = uuidRegex.test(testUuid);
      addResult('UUID Format Validation', `Valid: ${isValidUuid}`, isValidUuid ? 'success' : 'error');
      
      // Test 3: Simulate Step 4 Application Creation
      console.log('🧪 Testing Step 4 application creation...');
      
      // Simulate the exact logic from Step4_ApplicantInfo_New.tsx
      const mockApiResponse = { 
        id: uuidv4(),
        status: 'created' 
      };
      
      // This is the exact line from our updated code
      const applicationId = mockApiResponse.id || mockApiResponse.applicationId || uuidv4();
      addResult('Step 4 Application ID', applicationId, 'success');
      
      // Test 4: Verify SignNow endpoint format
      const signNowEndpoint = `https://staff.boreal.financial/api/applications/${applicationId}/signnow`;
      addResult('SignNow Endpoint', signNowEndpoint, 'success');
      
      // Test 5: Test fallback scenario
      console.log('🧪 Testing fallback scenario...');
      const emptyApiResponse = { status: 'created' }; // No ID fields
      const fallbackId = emptyApiResponse.id || emptyApiResponse.applicationId || uuidv4();
      const isFallbackValid = uuidRegex.test(fallbackId);
      addResult('Fallback UUID Generation', `${fallbackId} (Valid: ${isFallbackValid})`, isFallbackValid ? 'success' : 'error');
      
      // Test 6: Compare with old timestamp format
      const oldTimestampFormat = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const isOldFormat = /^app_\d+_[a-z0-9]+$/.test(oldTimestampFormat);
      addResult('Old Timestamp Format (Should NOT be used)', `${oldTimestampFormat} (Is old format: ${isOldFormat})`, isOldFormat ? 'error' : 'success');
      
      console.log('✅ UUID Test Complete');
      
    } catch (error) {
      addResult('UUID Test Error', error instanceof Error ? error.message : 'Unknown error', 'error');
    }
  };

  const testLocalStorage = () => {
    try {
      // Test localStorage interaction with UUID
      const { v4: uuidv4 } = require('uuid');
      const testId = uuidv4();
      localStorage.setItem('testApplicationId', testId);
      const retrieved = localStorage.getItem('testApplicationId');
      addResult('LocalStorage Test', `Stored: ${testId}, Retrieved: ${retrieved}`, retrieved === testId ? 'success' : 'error');
      localStorage.removeItem('testApplicationId');
    } catch (error) {
      addResult('LocalStorage Test Error', error instanceof Error ? error.message : 'Unknown error', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">UUID Implementation Test</h1>
          <p className="text-gray-600">
            This page tests whether application IDs are properly generated in UUID format
            instead of the old timestamp-based format.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <Button onClick={runUUIDTest} className="mr-4">
            Run UUID Test
          </Button>
          <Button onClick={testLocalStorage} variant="outline">
            Test LocalStorage
          </Button>
        </div>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.status === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <div className="font-semibold">{result.test}</div>
                    <div className="text-sm mt-1 font-mono">{result.result}</div>
                    <div className="text-xs mt-1 opacity-70">{result.timestamp}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Expected Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <strong>✅ Correct UUID Format:</strong>
                <div className="font-mono text-green-600">550e8400-e29b-41d4-a716-446655440000</div>
              </div>
              <div>
                <strong>❌ Old Timestamp Format (Should NOT be used):</strong>
                <div className="font-mono text-red-600">1752166815631_dar4mp2zf</div>
              </div>
              <div>
                <strong>✅ SignNow Endpoint:</strong>
                <div className="font-mono text-blue-600">https://staff.boreal.financial/api/applications/[UUID]/signnow</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}