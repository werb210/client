import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StatusCheck {
  name: string;
  url: string;
  status: 'checking' | 'success' | 'error';
  message: string;
  timing?: number;
  details?: any;
}

export default function StaffBackendStatus() {
  const [checks, setChecks] = useState<StatusCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateCheck = (name: string, update: Partial<StatusCheck>) => {
    setChecks(prev => prev.map(check => 
      check.name === name ? { ...check, ...update } : check
    ));
  };

  const runStatusChecks = async () => {
    setIsRunning(true);
    
    const initialChecks: StatusCheck[] = [
      { name: 'Staff Backend Health', url: 'https://staffportal.replit.app/api/health', status: 'checking', message: 'Checking...' },
      { name: 'Staff Backend Root', url: 'https://staffportal.replit.app', status: 'checking', message: 'Checking...' },
      { name: 'CORS Preflight', url: 'https://staffportal.replit.app/api/auth/register', status: 'checking', message: 'Checking...' },
      { name: 'User Endpoint', url: 'https://staffportal.replit.app/api/users', status: 'checking', message: 'Checking...' }
    ];
    
    setChecks(initialChecks);

    // Check each endpoint
    for (const check of initialChecks) {
      try {
        const startTime = Date.now();
        const response = await fetch(check.url, {
          method: check.name === 'CORS Preflight' ? 'OPTIONS' : 'GET',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          }
        });
        
        const timing = Date.now() - startTime;
        const contentType = response.headers.get('content-type');
        
        updateCheck(check.name, {
          status: response.ok ? 'success' : 'error',
          message: `${response.status} ${response.statusText} (${timing}ms)`,
          timing,
          details: {
            status: response.status,
            statusText: response.statusText,
            contentType,
            headers: Object.fromEntries(response.headers.entries())
          }
        });
      } catch (error: any) {
        updateCheck(check.name, {
          status: 'error',
          message: `Error: ${error.message}`,
          details: { error: error.message, type: error.name }
        });
      }
    }

    setIsRunning(false);
  };

  // Auto-run checks on component mount
  useEffect(() => {
    runStatusChecks();
  }, []);

  const getStatusColor = (status: StatusCheck['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'checking': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Staff Backend Status</CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time connectivity check for the staff backend API
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runStatusChecks} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Checking Status...' : 'Refresh Status Checks'}
          </Button>

          <div className="space-y-3">
            {checks.map((check) => (
              <Card key={check.name} className={`p-4 border-2 ${getStatusColor(check.status)}`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{check.name}</h3>
                      <Badge variant={check.status === 'success' ? 'default' : 'destructive'}>
                        {check.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{check.url}</p>
                    <p className="text-sm">{check.message}</p>
                    {check.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground">Details</summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(check.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  {check.timing && (
                    <Badge variant="outline">{check.timing}ms</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {checks.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Troubleshooting:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• If all checks fail: Staff backend may be down</li>
                <li>• If CORS fails: Backend needs to allowlist this domain</li>
                <li>• If some endpoints fail: Check backend routing</li>
                <li>• Green status means the endpoint is accessible</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}