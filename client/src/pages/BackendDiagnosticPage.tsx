import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function BackendDiagnosticPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    // Test 1: Basic connectivity
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      
      diagnostics.push({
        test: 'Backend Connectivity',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 'Staff backend is reachable' : `HTTP ${response.status} - ${response.statusText}`,
        details: `URL: ${import.meta.env.VITE_API_BASE_URL}/health`
      });
    } catch (error) {
      diagnostics.push({
        test: 'Backend Connectivity',
        status: 'error',
        message: 'Cannot reach staff backend',
        details: error instanceof Error ? error.message : 'Network error'
      });
    }

    // Test 2: CORS headers
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'OPTIONS',
        mode: 'cors',
        credentials: 'include'
      });
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
      };

      const hasCors = Object.values(corsHeaders).some(value => value !== null);
      
      diagnostics.push({
        test: 'CORS Configuration',
        status: hasCors ? 'success' : 'error',
        message: hasCors ? 'CORS headers present' : 'Missing CORS headers',
        details: JSON.stringify(corsHeaders, null, 2)
      });
    } catch (error) {
      diagnostics.push({
        test: 'CORS Configuration',
        status: 'error',
        message: 'CORS preflight failed',
        details: error instanceof Error ? error.message : 'CORS error'
      });
    }

    // Test 3: Authentication endpoint
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'testpass' })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const isHtml = contentType && contentType.includes('text/html');

      let responseText = '';
      try {
        responseText = await response.text();
      } catch (e) {
        responseText = 'Unable to read response body';
      }

      if (isHtml) {
        diagnostics.push({
          test: 'Authentication Endpoint',
          status: 'error',
          message: 'Endpoint returns HTML instead of JSON',
          details: `Content-Type: ${contentType}\nResponse preview: ${responseText.substring(0, 200)}...`
        });
      } else if (isJson) {
        diagnostics.push({
          test: 'Authentication Endpoint',
          status: 'success',
          message: 'Endpoint returns JSON response',
          details: `Status: ${response.status}\nContent-Type: ${contentType}`
        });
      } else {
        diagnostics.push({
          test: 'Authentication Endpoint',
          status: 'warning',
          message: 'Unexpected response format',
          details: `Content-Type: ${contentType}\nStatus: ${response.status}`
        });
      }
    } catch (error) {
      diagnostics.push({
        test: 'Authentication Endpoint',
        status: 'error',
        message: 'Authentication endpoint test failed',
        details: error instanceof Error ? error.message : 'Network error'
      });
    }

    // Test 4: Environment configuration
    const envConfig = {
      'VITE_API_BASE_URL': import.meta.env.VITE_API_BASE_URL,
      'NODE_ENV': import.meta.env.NODE_ENV,
      'DEV': import.meta.env.DEV
    };

    diagnostics.push({
      test: 'Environment Configuration',
      status: import.meta.env.VITE_API_BASE_URL ? 'success' : 'error',
      message: import.meta.env.VITE_API_BASE_URL ? 'API URL configured' : 'Missing API URL configuration',
      details: JSON.stringify(envConfig, null, 2)
    });

    setResults(diagnostics);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Backend Diagnostic Tool</h1>
        <p className="text-gray-600 mt-2">
          Diagnose staff backend API connectivity and configuration issues
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Staff Backend Configuration</CardTitle>
          <CardDescription>
            Current API endpoint: {import.meta.env.VITE_API_BASE_URL}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Diagnostic Results</h2>
          
          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    {result.test}
                  </CardTitle>
                  {getStatusBadge(result.status)}
                </div>
                <CardDescription>{result.message}</CardDescription>
              </CardHeader>
              {result.details && (
                <CardContent>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                    {result.details}
                  </pre>
                </CardContent>
              )}
            </Card>
          ))}

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              <ul className="list-disc list-inside space-y-2">
                <li>If connectivity fails: Verify staff backend is running at the configured URL</li>
                <li>If CORS is missing: Add CORS headers for {window.location.origin}</li>
                <li>If HTML responses: Ensure /auth/login endpoint returns JSON, not HTML pages</li>
                <li>If authentication fails: Verify the endpoint accepts POST requests with JSON body</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}