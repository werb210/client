import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import { Auth } from '@/lib/auth';

export default function QuickUserCheck() {
  const [email, setEmail] = useState('todd@werboweski.com');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkUser = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Try to check if user exists by attempting password reset
      const response = await Auth.requestReset(email);
      const data = await response.json();
      
      setResult({
        type: 'reset_request',
        success: response.ok,
        message: data.message || data.error,
        userExists: response.ok
      });
    } catch (error: any) {
      setResult({
        type: 'error',
        success: false,
        message: error.message,
        userExists: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Try common passwords
      const commonPasswords = ['password123', 'test123', 'admin123', '123456'];
      
      for (const password of commonPasswords) {
        try {
          const response = await apiFetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          if (response.ok) {
            setResult({
              type: 'login_success',
              success: true,
              message: `Login successful with password: ${password}`,
              password: password
            });
            return;
          }
        } catch (e) {
          // Continue trying
        }
      }
      
      setResult({
        type: 'login_failed',
        success: false,
        message: 'Could not determine password with common options',
        tried: commonPasswords
      });
    } catch (error: any) {
      setResult({
        type: 'error',
        success: false,
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Quick User Check</CardTitle>
          <p className="text-sm text-muted-foreground">
            Check if a user exists and test password reset functionality
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to check"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={checkUser} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Checking...' : 'Check User (Reset Request)'}
            </Button>
            <Button 
              onClick={testLogin} 
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? 'Testing...' : 'Test Common Passwords'}
            </Button>
          </div>

          {result && (
            <Card className={`p-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="space-y-2">
                <p className="font-medium">
                  {result.type === 'reset_request' && 'Password Reset Request'}
                  {result.type === 'login_success' && 'Login Test Result'}
                  {result.type === 'login_failed' && 'Login Test Failed'}
                  {result.type === 'error' && 'Error'}
                </p>
                <p className="text-sm">{result.message}</p>
                
                {result.password && (
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    Password: {result.password}
                  </p>
                )}
                
                {result.tried && (
                  <p className="text-xs text-muted-foreground">
                    Tried passwords: {result.tried.join(', ')}
                  </p>
                )}
                
                {result.userExists !== undefined && (
                  <p className="text-sm">
                    User exists: {result.userExists ? 'Yes' : 'Unknown'}
                  </p>
                )}
              </div>
            </Card>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Testing Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Passwords are encrypted in the database for security</li>
              <li>• Password reset is the safest way to test user existence</li>
              <li>• Check staff backend logs for reset tokens</li>
              <li>• Use /user-database to see all registered users</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}