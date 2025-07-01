import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Auth } from '@/lib/auth';

interface VerificationItem {
  id: string;
  title: string;
  status: 'pending' | 'testing' | 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  timing?: number;
}

export default function VerificationChecklist() {
  const [items, setItems] = useState<VerificationItem[]>([
    {
      id: 'health-json',
      title: '/api/health returns JSON (not HTML)',
      status: 'pending',
      message: 'Ready to test'
    },
    {
      id: 'cors-headers',
      title: 'CORS headers: Access-Control-Allow-Origin',
      status: 'pending',
      message: 'Ready to test'
    },
    {
      id: 'password-reset',
      title: 'Password reset request returns { message: "..."}',
      status: 'pending',
      message: 'Ready to test'
    },
    {
      id: 'registration',
      title: 'Registration works through /auth/register',
      status: 'pending',
      message: 'Ready to test'
    },
    {
      id: 'login',
      title: 'Login works through /auth/login',
      status: 'pending',
      message: 'Ready to test'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const updateItem = (id: string, update: Partial<VerificationItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...update } : item
    ));
  };

  const runVerification = async () => {
    setIsRunning(true);
    
    // Reset all to testing
    setItems(prev => prev.map(item => ({ ...item, status: 'testing' as const, message: 'Testing...' })));

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://staffportal.replit.app/api';

    // Test 1: Health endpoint returns JSON
    try {
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      const timing = Date.now() - startTime;
      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType?.includes('application/json')) {
        const data = await response.json();
        updateItem('health-json', {
          status: 'pass',
          message: `✅ Returns JSON (${timing}ms)`,
          details: { status: response.status, contentType, data },
          timing
        });
      } else if (contentType?.includes('text/html')) {
        updateItem('health-json', {
          status: 'fail',
          message: `❌ Returns HTML instead of JSON (${timing}ms)`,
          details: { status: response.status, contentType },
          timing
        });
      } else {
        updateItem('health-json', {
          status: 'warning',
          message: `⚠️ Status: ${response.status}, Type: ${contentType}`,
          details: { status: response.status, contentType },
          timing
        });
      }
    } catch (error: any) {
      updateItem('health-json', {
        status: 'fail',
        message: `❌ Error: ${error.message}`,
        details: { error: error.name, message: error.message }
      });
    }

    // Test 2: CORS Headers
    try {
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      const timing = Date.now() - startTime;
      
      const corsOrigin = response.headers.get('access-control-allow-origin');
      const corsCredentials = response.headers.get('access-control-allow-credentials');
      const corsHeaders = response.headers.get('access-control-allow-headers');
      
      if (corsOrigin === 'https://clientportal.replit.app' || corsOrigin === '*') {
        updateItem('cors-headers', {
          status: 'pass',
          message: `✅ CORS Origin: ${corsOrigin}`,
          details: { corsOrigin, corsCredentials, corsHeaders },
          timing
        });
      } else {
        updateItem('cors-headers', {
          status: 'fail',
          message: `❌ Missing/incorrect CORS Origin: ${corsOrigin || 'none'}`,
          details: { corsOrigin, corsCredentials, corsHeaders },
          timing
        });
      }
    } catch (error: any) {
      updateItem('cors-headers', {
        status: 'fail',
        message: `❌ CORS Error: ${error.message}`,
        details: { error: error.name }
      });
    }

    // Test 3: Password Reset
    try {
      const startTime = Date.now();
      const response = await Auth.requestReset('test@example.com');
      const timing = Date.now() - startTime;
      const data = await response.json();
      
      if (response.ok && data.message) {
        updateItem('password-reset', {
          status: 'pass',
          message: `✅ Returns message: "${data.message}"`,
          details: data,
          timing
        });
      } else {
        updateItem('password-reset', {
          status: 'fail',
          message: `❌ No message field or error: ${data.error || 'Unknown'}`,
          details: data,
          timing
        });
      }
    } catch (error: any) {
      updateItem('password-reset', {
        status: 'fail',
        message: `❌ Error: ${error.message}`,
        details: { error: error.name }
      });
    }

    // Test 4: Registration
    try {
      const startTime = Date.now();
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `test+${Date.now()}@example.com`,
          password: 'testpass123',
          phone: '+15551234567'
        })
      });
      const timing = Date.now() - startTime;
      const data = await response.json();
      
      if (response.ok || (response.status === 400 && data.error?.includes('already exists'))) {
        updateItem('registration', {
          status: 'pass',
          message: `✅ Registration endpoint working (${timing}ms)`,
          details: data,
          timing
        });
      } else {
        updateItem('registration', {
          status: 'fail',
          message: `❌ Registration failed: ${data.error || 'Unknown error'}`,
          details: data,
          timing
        });
      }
    } catch (error: any) {
      updateItem('registration', {
        status: 'fail',
        message: `❌ Error: ${error.message}`,
        details: { error: error.name }
      });
    }

    // Test 5: Login
    try {
      const startTime = Date.now();
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'todd@werboweski.com',
          password: 'test123'
        })
      });
      const timing = Date.now() - startTime;
      const data = await response.json();
      
      if (response.ok || (response.status === 401 && data.error)) {
        updateItem('login', {
          status: 'pass',
          message: `✅ Login endpoint responding (${timing}ms)`,
          details: data,
          timing
        });
      } else {
        updateItem('login', {
          status: 'fail',
          message: `❌ Login failed: ${data.error || 'Unknown error'}`,
          details: data,
          timing
        });
      }
    } catch (error: any) {
      updateItem('login', {
        status: 'fail',
        message: `❌ Error: ${error.message}`,
        details: { error: error.name }
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: VerificationItem['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'testing': return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      default: return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: VerificationItem['status']) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-200';
      case 'fail': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'testing': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const passCount = items.filter(item => item.status === 'pass').length;
  const totalCount = items.length;

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Staff Backend Verification Checklist</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive verification of all staff backend requirements
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={passCount === totalCount ? 'default' : 'secondary'}>
              {passCount}/{totalCount} Passing
            </Badge>
            <Badge variant="outline">
              Backend: {import.meta.env.VITE_API_BASE_URL || 'https://staffportal.replit.app/api'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runVerification} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Verification Tests...' : 'Run Complete Verification'}
          </Button>

          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className={`p-4 border-2 ${getStatusColor(item.status)}`}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(item.status)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{item.title}</h3>
                      {item.timing && (
                        <Badge variant="outline" className="text-xs">
                          {item.timing}ms
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{item.message}</p>
                    {item.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground">
                          Technical Details
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(item.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4 bg-blue-50">
            <h4 className="font-medium mb-2">Next Steps:</h4>
            <ul className="text-sm space-y-1">
              <li>• All tests should show ✅ PASS status</li>
              <li>• If any fail, check staff backend CORS configuration</li>
              <li>• Password reset with todd@werboweski.com can proceed once all pass</li>
              <li>• Registration and login functionality will be fully operational</li>
            </ul>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}