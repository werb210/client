import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AuthAPI } from '@/lib/authApi';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function PasswordResetDiagnostic() {
  const [email, setEmail] = useState('test@example.com');
  const [testToken, setTestToken] = useState('test-token-123');
  const [newPassword, setNewPassword] = useState('newpassword123');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const addResult = (step: string, status: 'success' | 'error', message: string, details?: any) => {
    setResults(prev => [...prev, { step, status, message, details }]);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: API Connectivity
    addResult('Connectivity', 'pending', 'Testing API connectivity...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`, {
        credentials: 'include',
        mode: 'cors'
      });
      
      if (response.ok) {
        addResult('Connectivity', 'success', 'API endpoint is reachable');
      } else {
        addResult('Connectivity', 'error', `API returned ${response.status}`);
      }
    } catch (error) {
      addResult('Connectivity', 'error', `Network error: ${error.message}`);
    }

    // Test 2: Password Reset Request
    addResult('Reset Request', 'pending', 'Testing password reset request...');
    try {
      const resetResponse = await AuthAPI.requestReset(email);
      const responseText = await resetResponse.text();
      
      if (resetResponse.ok) {
        addResult('Reset Request', 'success', 'Password reset request successful', {
          status: resetResponse.status,
          response: responseText
        });
      } else {
        addResult('Reset Request', 'error', `Request failed: ${resetResponse.status}`, {
          status: resetResponse.status,
          response: responseText
        });
      }
    } catch (error) {
      addResult('Reset Request', 'error', `Request error: ${error.message}`);
    }

    // Test 3: Reset Password (with test token)
    addResult('Reset Password', 'pending', 'Testing password reset with token...');
    try {
      const resetPasswordResponse = await AuthAPI.resetPassword(testToken, newPassword);
      const responseText = await resetPasswordResponse.text();
      
      if (resetPasswordResponse.ok) {
        addResult('Reset Password', 'success', 'Password reset successful', {
          status: resetPasswordResponse.status,
          response: responseText
        });
      } else {
        addResult('Reset Password', 'error', `Reset failed: ${resetPasswordResponse.status}`, {
          status: resetPasswordResponse.status,
          response: responseText
        });
      }
    } catch (error) {
      addResult('Reset Password', 'error', `Reset error: ${error.message}`);
    }

    // Test 4: Check for email configuration
    addResult('Email Config', 'pending', 'Checking email configuration...');
    try {
      const configResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/config/email`, {
        credentials: 'include',
        mode: 'cors'
      });
      
      if (configResponse.ok) {
        const configData = await configResponse.json();
        addResult('Email Config', 'success', 'Email configuration accessible', configData);
      } else {
        addResult('Email Config', 'error', `Config check failed: ${configResponse.status}`);
      }
    } catch (error) {
      addResult('Email Config', 'error', `Config error: ${error.message}`);
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-teal-700">
            Password Reset Diagnostic Tool
          </CardTitle>
          <p className="text-center text-gray-600">
            Test password reset functionality and email delivery
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="email">Test Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="token">Test Token</Label>
              <Input
                id="token"
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                placeholder="test-token-123"
              />
            </div>
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="newpassword123"
              />
            </div>
          </div>

          {/* Environment Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Environment Configuration</h3>
            <div className="text-sm space-y-1">
              <div><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL}</div>
              <div><strong>Mode:</strong> {import.meta.env.MODE}</div>
              <div><strong>Dev Mode:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {/* Run Diagnostic */}
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {isRunning ? 'Running Diagnostic...' : 'Run Password Reset Diagnostic'}
          </Button>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Diagnostic Results</h3>
              {results.map((result, index) => (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: result.status === 'success' ? '#10b981' : result.status === 'error' ? '#ef4444' : '#f59e0b' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{result.step}</span>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600">View Details</summary>
                        <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Email Troubleshooting Guide */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Email Troubleshooting Checklist</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check if SENDGRID_API_KEY is configured in staff backend</li>
                <li>• Verify email address is registered in the system</li>
                <li>• Check spam/junk folder for reset emails</li>
                <li>• Ensure SendGrid sender domain is verified</li>
                <li>• Check staff backend logs for email sending errors</li>
                <li>• Verify rate limiting isn't blocking email delivery</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}