import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  endpoint: string;
  status: 'testing' | 'success' | 'error' | 'unreachable';
  message: string;
  timing?: number;
  details?: any;
}

export default function BackendFallback() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [email, setEmail] = useState('todd@werboweski.com');
  const [password, setPassword] = useState('test123');
  const { toast } = useToast();

  const updateResult = (endpoint: string, update: Partial<TestResult>) => {
    setResults(prev => prev.map(result => 
      result.endpoint === endpoint ? { ...result, ...update } : result
    ));
  };

  const testStaffBackend = async () => {
    setIsRunning(true);
    setResults([
      { endpoint: 'Health Check', status: 'testing', message: 'Testing...' },
      { endpoint: 'User Registration', status: 'testing', message: 'Testing...' },
      { endpoint: 'User Login', status: 'testing', message: 'Testing...' },
      { endpoint: 'Password Reset', status: 'testing', message: 'Testing...' }
    ]);

    // Test 1: Health Check
    try {
      const startTime = Date.now();
      const response = await fetch('https://staffportal.replit.app/api/health', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      const timing = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        updateResult('Health Check', {
          status: 'success',
          message: `Backend is accessible (${timing}ms)`,
          timing,
          details: data
        });
      } else {
        updateResult('Health Check', {
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          timing
        });
      }
    } catch (error: any) {
      updateResult('Health Check', {
        status: 'unreachable',
        message: `Backend unreachable: ${error.message}`,
        details: { error: error.name, message: error.message }
      });
    }

    // Test 2: Registration
    try {
      const startTime = Date.now();
      const response = await fetch('https://staffportal.replit.app/api/auth/register', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test+${Date.now()}@example.com`,
          password: 'test123',
          phone: '+15551234567'
        })
      });
      const timing = Date.now() - startTime;
      const data = await response.json();
      
      updateResult('User Registration', {
        status: response.ok ? 'success' : 'error',
        message: response.ok ? `Registration works (${timing}ms)` : `Error: ${data.error || 'Registration failed'}`,
        timing,
        details: data
      });
    } catch (error: any) {
      updateResult('User Registration', {
        status: 'unreachable',
        message: `Registration endpoint unreachable: ${error.message}`,
        details: { error: error.name }
      });
    }

    // Test 3: Login with provided credentials
    try {
      const startTime = Date.now();
      const response = await fetch('https://staffportal.replit.app/api/auth/login', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const timing = Date.now() - startTime;
      const data = await response.json();
      
      updateResult('User Login', {
        status: response.ok ? 'success' : 'error',
        message: response.ok ? `Login successful (${timing}ms)` : `Login failed: ${data.error || 'Invalid credentials'}`,
        timing,
        details: data
      });
    } catch (error: any) {
      updateResult('User Login', {
        status: 'unreachable',
        message: `Login endpoint unreachable: ${error.message}`,
        details: { error: error.name }
      });
    }

    // Test 4: Password Reset
    try {
      const startTime = Date.now();
      const response = await fetch('https://staffportal.replit.app/api/auth/request-reset', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const timing = Date.now() - startTime;
      const data = await response.json();
      
      updateResult('Password Reset', {
        status: response.ok ? 'success' : 'error',
        message: response.ok ? `Reset request works (${timing}ms)` : `Reset failed: ${data.error || 'Request failed'}`,
        timing,
        details: data
      });
    } catch (error: any) {
      updateResult('Password Reset', {
        status: 'unreachable',
        message: `Reset endpoint unreachable: ${error.message}`,
        details: { error: error.name }
      });
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'unreachable': return 'bg-red-100 text-red-800 border-red-200';
      case 'testing': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Staff Backend Connectivity & Fallback Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive test of staff backend endpoints and authentication
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Test Email</Label>
              <Input
                id="test-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email for login test"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-password">Test Password</Label>
              <Input
                id="test-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password for login test"
              />
            </div>
          </div>

          <Button 
            onClick={testStaffBackend} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Testing Staff Backend...' : 'Run Complete Backend Test'}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results:</h3>
              {results.map((result) => (
                <Card key={result.endpoint} className={`p-4 border-2 ${getStatusColor(result.status)}`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{result.endpoint}</h4>
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm">{result.message}</p>
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">Response Details</summary>
                          <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    {result.timing && (
                      <Badge variant="outline">{result.timing}ms</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2">Connectivity Status:</h4>
            <div className="text-sm text-amber-800 space-y-1">
              <p>• <strong>Staff Backend URL:</strong> https://staffportal.replit.app/api</p>
              <p>• <strong>Expected:</strong> All endpoints should return SUCCESS status</p>
              <p>• <strong>If UNREACHABLE:</strong> Staff backend deployment may be down</p>
              <p>• <strong>If ERROR:</strong> Backend is running but has configuration issues</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}