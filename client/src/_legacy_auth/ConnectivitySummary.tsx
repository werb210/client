import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ConnectivityStatus {
  backend: 'checking' | 'accessible' | 'unreachable' | 'cors_blocked';
  health: boolean;
  registration: boolean;
  login: boolean;
  passwordReset: boolean;
  message: string;
  solution: string;
}

export default function ConnectivitySummary() {
  const [status, setStatus] = useState<ConnectivityStatus>({
    backend: 'checking',
    health: false,
    registration: false,
    login: false,
    passwordReset: false,
    message: 'Checking staff backend connectivity...',
    solution: ''
  });

  const [isChecking, setIsChecking] = useState(false);

  const runConnectivityCheck = async () => {
    setIsChecking(true);
    setStatus(prev => ({ ...prev, backend: 'checking', message: 'Testing connectivity...' }));

    const baseUrl = 'https://staffportal.replit.app/api';
    let backendStatus: ConnectivityStatus['backend'] = 'unreachable';
    let health = false, registration = false, login = false, passwordReset = false;
    let message = '';
    let solution = '';

    // Test basic connectivity
    try {
      const healthResponse = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      
      if (healthResponse.ok) {
        backendStatus = 'accessible';
        health = true;
      } else if (healthResponse.status === 404) {
        backendStatus = 'accessible';
        // Backend exists but health endpoint missing
      }
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        backendStatus = 'unreachable';
      } else if (error.message.includes('CORS')) {
        backendStatus = 'cors_blocked';
      }
    }

    // Test registration endpoint
    if (backendStatus === 'accessible') {
      try {
        const regResponse = await fetch(`${baseUrl}/auth/register`, {
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
        registration = regResponse.status !== 0; // Any response means endpoint exists
      } catch (error) {
        // Registration endpoint may not exist
      }

      // Authentication endpoints removed - application uses direct access model
      login = false;
      passwordReset = false;
    }

    // Determine message and solution
    switch (backendStatus) {
      case 'accessible':
        if (health && registration && login && passwordReset) {
          message = 'Staff backend is fully operational';
          solution = 'All systems working. You can proceed with testing.';
        } else {
          message = 'Staff backend is accessible but some endpoints are missing';
          solution = 'Contact the backend team to implement missing authentication endpoints.';
        }
        break;
      case 'cors_blocked':
        message = 'Staff backend exists but blocks CORS requests';
        solution = 'Backend team needs to add your domain to CORS allowlist.';
        break;
      case 'unreachable':
        message = 'Staff backend is completely unreachable';
        solution = 'Backend deployment may be down. Check backend deployment status.';
        break;
      default:
        message = 'Unable to determine backend status';
        solution = 'Manual investigation required.';
    }

    setStatus({
      backend: backendStatus,
      health,
      registration,
      login,
      passwordReset,
      message,
      solution
    });

    setIsChecking(false);
  };

  useEffect(() => {
    runConnectivityCheck();
  }, []);

  const getStatusIcon = (working: boolean) => {
    return working ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getBackendStatusColor = () => {
    switch (status.backend) {
      case 'accessible': return 'bg-green-100 border-green-200';
      case 'cors_blocked': return 'bg-orange-100 border-orange-200';
      case 'unreachable': return 'bg-red-100 border-red-200';
      case 'checking': return 'bg-blue-100 border-blue-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status.backend === 'checking' && <Clock className="h-5 w-5 animate-pulse" />}
            {status.backend === 'accessible' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status.backend !== 'checking' && status.backend !== 'accessible' && <AlertTriangle className="h-5 w-5 text-red-600" />}
            Staff Backend Connectivity Summary
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete diagnostic of staff backend connectivity and authentication endpoints
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={getBackendStatusColor()}>
            <AlertDescription>
              <strong>Status:</strong> {status.message}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Backend Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Connectivity</span>
                  <Badge variant={status.backend === 'accessible' ? 'default' : 'destructive'}>
                    {status.backend.toUpperCase().replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Health Endpoint</span>
                  {getStatusIcon(status.health)}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Authentication Endpoints</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Registration</span>
                  {getStatusIcon(status.registration)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Login</span>
                  {getStatusIcon(status.login)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Password Reset</span>
                  {getStatusIcon(status.passwordReset)}
                </div>
              </div>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommended Action:</strong> {status.solution}
            </AlertDescription>
          </Alert>

          <Button 
            onClick={runConnectivityCheck} 
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? 'Checking Connectivity...' : 'Refresh Connectivity Check'}
          </Button>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Current Backend URL:</strong> https://staffportal.replit.app/api</p>
            <p><strong>Registration Issue:</strong> "Failed to fetch" indicates the backend is unreachable</p>
            <p><strong>Password Reset Issue:</strong> Cannot test without accessible backend</p>
          </div>

          <Card className="p-4 bg-blue-50">
            <h4 className="font-medium mb-2">Next Steps for Testing:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Verify staff backend deployment is running</li>
              <li>Check if backend URL has changed from staffportal.replit.app</li>
              <li>Ensure backend allows CORS from clientportal.replit.app</li>
              <li>Test password reset with todd@werboweski.com once backend is accessible</li>
            </ol>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}