import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AuthAPI } from '@/lib/authApi';
import { useAuth } from '@/context/AuthContext';

interface TestStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: string;
}

export default function AuthFlowTest() {
  const [steps, setSteps] = useState<TestStep[]>([
    { id: 'register', name: 'Registration', status: 'pending' },
    { id: 'otp', name: 'OTP Verification', status: 'pending' },
    { id: 'auth-check', name: 'Authentication Check', status: 'pending' },
    { id: 'logout', name: 'Logout', status: 'pending' }
  ]);
  
  const [email] = useState('test@borealfinance.com');
  const [phone] = useState('+15878881837');
  const [password] = useState('TestPass123!');
  const [otpCode, setOtpCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  const updateStep = (id: string, status: TestStep['status'], message?: string, details?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, status, message, details } : step
    ));
  };

  const runFullAuthTest = async () => {
    setIsRunning(true);
    
    try {
      // Step 1: Registration
      updateStep('register', 'running', 'Creating account...');
      
      const registerResponse = await AuthAPI.register({ email, phone, password });
      
      if (registerResponse.ok) {
        const registerResult = await registerResponse.json();
        updateStep('register', 'success', 'Account created successfully', JSON.stringify(registerResult));
        
        if (registerResult.message === "OTP sent" || registerResult.otpSent) {
          toast({
            title: 'Registration Successful',
            description: 'Enter the OTP code sent to +15878881837 to continue the test',
          });
        }
      } else {
        const errorData = await registerResponse.json().catch(() => ({ message: 'Registration failed' }));
        updateStep('register', 'error', `Registration failed: ${registerResponse.status}`, JSON.stringify(errorData));
        return;
      }
    } catch (error) {
      updateStep('register', 'error', 'Network error during registration', `${error}`);
      return;
    }
    
    setIsRunning(false);
    toast({
      title: 'Registration Complete',
      description: 'Enter OTP code and click "Verify OTP" to continue',
    });
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a 6-digit OTP code',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);
    
    try {
      // Step 2: OTP Verification
      updateStep('otp', 'running', 'Verifying OTP...');
      
      const otpResponse = await AuthAPI.verifyOtp({ email, code: otpCode });
      
      if (otpResponse.ok) {
        const otpResult = await otpResponse.json();
        updateStep('otp', 'success', 'OTP verified successfully', JSON.stringify(otpResult));
        
        // Step 3: Check authentication status
        updateStep('auth-check', 'running', 'Checking authentication...');
        await refreshUser();
        
        const userResponse = await AuthAPI.getCurrentUser();
        if (userResponse.ok) {
          const userData = await userResponse.json();
          updateStep('auth-check', 'success', 'User authenticated', JSON.stringify(userData));
        } else {
          updateStep('auth-check', 'error', 'Authentication check failed', `Status: ${userResponse.status}`);
        }
        
        toast({
          title: 'Authentication Successful',
          description: 'User is now logged in with session cookie',
        });
        
      } else {
        const errorData = await otpResponse.json().catch(() => ({ message: 'OTP verification failed' }));
        updateStep('otp', 'error', `OTP verification failed: ${otpResponse.status}`, JSON.stringify(errorData));
      }
    } catch (error) {
      updateStep('otp', 'error', 'Network error during OTP verification', `${error}`);
    }
    
    setIsRunning(false);
  };

  const testLogout = async () => {
    setIsRunning(true);
    
    try {
      updateStep('logout', 'running', 'Logging out...');
      
      const logoutResponse = await AuthAPI.logout();
      
      if (logoutResponse.ok) {
        updateStep('logout', 'success', 'Logout successful');
        await refreshUser();
        
        toast({
          title: 'Logout Successful',
          description: 'User session cleared',
        });
      } else {
        updateStep('logout', 'error', `Logout failed: ${logoutResponse.status}`);
      }
    } catch (error) {
      updateStep('logout', 'error', 'Network error during logout', `${error}`);
    }
    
    setIsRunning(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Complete Authentication Flow Test</CardTitle>
          <p className="text-sm text-gray-600">
            Tests registration → OTP verification → authentication → logout flow
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test credentials */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Test Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div><strong>Email:</strong> {email}</div>
              <div><strong>Phone:</strong> {phone}</div>
              <div><strong>Password:</strong> {password}</div>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={runFullAuthTest} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? 'Running...' : '1. Start Registration Test'}
            </Button>
            
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="flex-1"
              />
              <Button 
                onClick={verifyOTP}
                disabled={isRunning || !otpCode}
              >
                2. Verify OTP
              </Button>
            </div>
            
            <Button 
              onClick={testLogout}
              disabled={isRunning}
              variant="outline"
            >
              3. Test Logout
            </Button>
          </div>

          {/* Test results */}
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {steps.map((step) => (
              <div key={step.id} className="border rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant={
                      step.status === 'success' ? 'default' :
                      step.status === 'error' ? 'destructive' :
                      step.status === 'running' ? 'secondary' : 'outline'
                    }
                  >
                    {step.status.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{step.name}</span>
                </div>
                {step.message && (
                  <p className="text-sm text-gray-700 mb-1">{step.message}</p>
                )}
                {step.details && (
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {step.details}
                  </pre>
                )}
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Click "Start Registration Test" to create account and send SMS OTP</li>
              <li>Check phone +15878881837 for SMS code</li>
              <li>Enter 6-digit code and click "Verify OTP"</li>
              <li>Click "Test Logout" to complete the full flow test</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}