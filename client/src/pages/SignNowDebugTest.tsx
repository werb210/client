/**
 * SignNow Debug Test - Per User Debug Instructions
 * 1. Confirm API Endpoint with UUID format
 * 2. Display clear error messages
 * 3. Verify network requests in dev tools
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useFormData } from '@/context/FormDataContext';
import { useToast } from '@/hooks/use-toast';
import { extractUuid } from '@/lib/uuidUtils';
import { 
  Play,
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Loader2,
  Eye,
  ExternalLink,
  FileText,
  Copy
} from 'lucide-react';

interface DebugResult {
  test: string;
  status: 'success' | 'error' | 'testing' | 'pending';
  details: string;
  data?: any;
  timestamp?: string;
}

export default function SignNowDebugTest() {
  const { state, dispatch } = useFormData();
  const { toast } = useToast();
  
  const [isRunning, setIsRunning] = useState(false);
  const [debugResults, setDebugResults] = useState<DebugResult[]>([]);
  const [applicationId, setApplicationId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState('');

  // Generate a test UUID if none exists
  useEffect(() => {
    const contextId = state.applicationId;
    const storageId = localStorage.getItem('applicationId');
    const finalId = contextId || extractUuid(storageId || '') || crypto.randomUUID();
    
    setApplicationId(finalId);
    
    // Ensure we have a clean UUID stored
    if (!contextId) {
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: { applicationId: finalId }
      });
      localStorage.setItem('applicationId', finalId);
    }
  }, [state.applicationId, dispatch]);

  const updateResult = (test: string, status: DebugResult['status'], details: string, data?: any) => {
    setDebugResults(prev => {
      const existing = prev.find(r => r.test === test);
      const result: DebugResult = {
        test,
        status,
        details,
        data,
        timestamp: new Date().toISOString()
      };
      
      if (existing) {
        return prev.map(r => r.test === test ? result : r);
      } else {
        return [...prev, result];
      }
    });
  };

  const runSignNowDebugTest = async () => {
    setIsRunning(true);
    setDebugResults([]);
    
    console.group('🔍 SignNow Debug Test - Network Tab Verification');
    console.log('User Instructions: Open browser dev tools → Network tab');
    console.log('Expected API Call: POST https://staff.boreal.financial/api/applications/[UUID]/signnow');
    
    try {
      // Test 1: Verify UUID Format
      setCurrentStep('Verifying UUID format...');
      updateResult('UUID Format Verification', 'testing', 'Checking application ID format...');
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUUID = uuidRegex.test(applicationId);
      
      if (isValidUUID) {
        updateResult('UUID Format Verification', 'success', `✅ Valid UUID format: ${applicationId}`, {
          applicationId,
          format: 'UUID v4',
          pattern: '550e8400-e29b-41d4-a716-446655440000'
        });
        console.log('✅ UUID Format Check:', applicationId, 'VALID');
      } else {
        updateResult('UUID Format Verification', 'error', `❌ Invalid UUID format: ${applicationId}`, {
          applicationId,
          expected: '550e8400-e29b-41d4-a716-446655440000',
          received: applicationId
        });
        console.error('❌ UUID Format Check:', applicationId, 'INVALID');
      }

      // Test 2: Confirm API Endpoint Construction
      setCurrentStep('Building API endpoint...');
      updateResult('API Endpoint Construction', 'testing', 'Building SignNow API URL...');
      
      const apiBaseUrl = 'https://staff.boreal.financial';
      const signNowEndpoint = `${apiBaseUrl}/api/applications/${applicationId}/signnow`;
      
      updateResult('API Endpoint Construction', 'success', `API URL: ${signNowEndpoint}`, {
        baseUrl: apiBaseUrl,
        fullEndpoint: signNowEndpoint,
        applicationId,
        method: 'POST'
      });
      console.log('🔗 API Endpoint:', signNowEndpoint);

      // Test 3: Check Application Data Availability
      setCurrentStep('Verifying application data...');
      updateResult('Application Data Check', 'testing', 'Checking form data availability...');
      
      const hasBusinessData = !!(state.operatingName || state.legalName);
      const hasApplicantData = !!(state.firstName && state.lastName);
      const hasFundingAmount = !!(state.fundingAmount);
      
      if (hasBusinessData && hasApplicantData && hasFundingAmount) {
        updateResult('Application Data Check', 'success', 'Application data complete for SignNow', {
          businessName: state.operatingName || state.legalName,
          applicantName: `${state.firstName} ${state.lastName}`,
          fundingAmount: state.fundingAmount,
          dataComplete: true
        });
      } else {
        updateResult('Application Data Check', 'error', 'Missing required application data', {
          hasBusinessData,
          hasApplicantData,
          hasFundingAmount,
          missing: [
            !hasBusinessData && 'Business Name',
            !hasApplicantData && 'Applicant Name',
            !hasFundingAmount && 'Funding Amount'
          ].filter(Boolean)
        });
      }

      // Test 4: Execute Actual SignNow API Call
      setCurrentStep('Making SignNow API request...');
      updateResult('SignNow API Request', 'testing', 'Sending POST request to staff backend...');
      
      console.log('📤 Making SignNow API call...');
      console.log('   Method: POST');
      console.log('   URL:', `/api/applications/${applicationId}/signnow`);
      console.log('   Headers: Content-Type: application/json, Authorization: Bearer [TOKEN]');
      console.log('   Body:', JSON.stringify({ applicationId }));
      
      const response = await fetch(`/api/applications/${applicationId}/signnow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify({ applicationId }),
        credentials: 'include'
      });

      console.log('📥 Response Status:', response.status, response.statusText);
      
      const responseData = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        parsedData = responseData;
      }

      if (response.ok) {
        updateResult('SignNow API Request', 'success', `✅ API call successful (${response.status})`, {
          status: response.status,
          statusText: response.statusText,
          response: parsedData,
          endpoint: `/api/applications/${applicationId}/signnow`
        });
        console.log('✅ SignNow API Success:', parsedData);
        
        toast({
          title: "SignNow API Success",
          description: `Received ${response.status} response from staff backend`,
        });
      } else {
        const errorMessage = parsedData?.error || response.statusText || 'Unknown error';
        updateResult('SignNow API Request', 'error', `❌ API call failed (${response.status}): ${errorMessage}`, {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          response: parsedData,
          endpoint: `/api/applications/${applicationId}/signnow`
        });
        console.error('❌ SignNow API Error:', response.status, errorMessage, parsedData);
        
        toast({
          title: "SignNow API Error",
          description: `${response.status}: ${errorMessage}`,
          variant: "destructive"
        });
      }

      // Test 5: Network Tab Verification Instructions
      updateResult('Network Tab Verification', 'success', 'Check browser dev tools Network tab for the API call', {
        instructions: [
          'Open browser dev tools (F12)',
          'Go to Network tab',
          'Look for: POST /api/applications/[UUID]/signnow',
          'Verify UUID format in URL',
          'Check request payload includes applicationId',
          'Verify response status and content'
        ],
        expectedUrl: `/api/applications/${applicationId}/signnow`,
        method: 'POST'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateResult('SignNow API Request', 'error', `❌ Network error: ${errorMessage}`, {
        error: errorMessage,
        type: 'NetworkError'
      });
      console.error('❌ SignNow Debug Test Failed:', error);
      
      toast({
        title: "Debug Test Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentStep('');
      console.groupEnd();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "UUID copied to clipboard"
    });
  };

  const getStatusIcon = (status: DebugResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'testing': return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBg = (status: DebugResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'testing': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Eye className="w-6 h-6 text-blue-600" />
            SignNow Debug Test - Network Tab Verification
          </CardTitle>
          <p className="text-gray-600">
            Debug tool per user instructions: Verify UUID format, API endpoint construction, and network requests
          </p>
        </CardHeader>
      </Card>

      {/* Current Application ID */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Current Application ID
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
              {applicationId}
            </code>
            <Button
              onClick={() => copyToClipboard(applicationId)}
              size="sm"
              variant="outline"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Badge variant={applicationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? "default" : "destructive"}>
              {applicationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? "Valid UUID" : "Invalid Format"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Debug Instructions */}
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          <strong>🔍 Debug Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Open browser dev tools (F12) → Network tab</li>
            <li>Click "Run SignNow Debug Test" below</li>
            <li>Look for: <code>POST /api/applications/[UUID]/signnow</code></li>
            <li>Verify UUID format in URL (not timestamp-based)</li>
            <li>Check response status and error messages</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Test Execution</CardTitle>
          <p className="text-sm text-gray-600">
            {currentStep || 'Click to run comprehensive SignNow debug test'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runSignNowDebugTest} 
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Debug Test...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run SignNow Debug Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Debug Results */}
      {debugResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Debug Test Results</h3>
          {debugResults.map((result, index) => (
            <Card key={index} className={`${getStatusBg(result.status)} transition-colors`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-mono text-blue-600">{result.test}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm mb-3">{result.details}</p>
                {result.data && (
                  <div className="text-xs p-3 bg-white rounded border">
                    <strong>Debug Data:</strong>
                    <pre className="mt-1 overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
                {result.timestamp && (
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Expected API Call Format */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            Expected API Call Format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <div><strong>Method:</strong> POST</div>
            <div><strong>URL:</strong> <code>https://staff.boreal.financial/api/applications/[UUID]/signnow</code></div>
            <div><strong>Headers:</strong> Content-Type: application/json, Authorization: Bearer [TOKEN]</div>
            <div><strong>Body:</strong> <code>{`{"applicationId": "550e8400-e29b-41d4-a716-446655440000"}`}</code></div>
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>UUID Verification:</strong> Ensure the URL contains a valid UUID format (550e8400-e29b-41d4-a716-446655440000) 
              and NOT timestamp-based IDs like (1752166815631_dar4mp2zf).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}