import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/lib/api";

interface TestResult {
  timestamp: string;
  phoneNumber: string;
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  response?: any;
  error?: string;
  deliveryTime?: number;
}

export default function SMSDiagnostic() {
  const [phoneNumber, setPhoneNumber] = useState('+15878881837'); // Development testing number
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testPhoneFormat = (phone: string) => {
    const patterns = [
      { name: 'E.164', regex: /^\+[1-9]\d{1,14}$/, example: '+15878881837' },
      { name: 'US Format', regex: /^\+1[2-9]\d{9}$/, example: '+15878881837' },
      { name: 'Canadian Format', regex: /^\+1[2-9]\d{9}$/, example: '+15878881837' }
    ];
    
    return patterns.map(pattern => ({
      ...pattern,
      valid: pattern.regex.test(phone)
    }));
  };

  const testRegistrationSMS = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const testData = {
        email: `sms-test-${Date.now()}@example.com`,
        password: 'TestPass123!',
        phone: phoneNumber
      };

      console.log('Testing SMS delivery to:', phoneNumber);
      
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const deliveryTime = Date.now() - startTime;
      
      addResult({
        timestamp: new Date().toLocaleTimeString(),
        phoneNumber,
        endpoint: 'Registration SMS',
        status: 'success',
        response: response,
        deliveryTime
      });
      
    } catch (error: any) {
      addResult({
        timestamp: new Date().toLocaleTimeString(),
        phoneNumber,
        endpoint: 'Registration SMS',
        status: 'error',
        error: error.message || 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testPasswordResetSMS = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      console.log('Testing password reset SMS to:', phoneNumber);
      
      const response = await apiFetch('/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      const deliveryTime = Date.now() - startTime;
      
      addResult({
        timestamp: new Date().toLocaleTimeString(),
        phoneNumber,
        endpoint: 'Password Reset SMS',
        status: 'success',
        response: response,
        deliveryTime
      });
      
    } catch (error: any) {
      addResult({
        timestamp: new Date().toLocaleTimeString(),
        phoneNumber,
        endpoint: 'Password Reset SMS',
        status: 'error',
        error: error.message || 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testOTPVerification = async () => {
    setIsLoading(true);
    
    try {
      const testCode = '123456'; // Test OTP code
      console.log('Testing OTP verification for:', phoneNumber);
      
      const response = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNumber,
          otp: testCode 
        })
      });

      addResult({
        timestamp: new Date().toLocaleTimeString(),
        phoneNumber,
        endpoint: 'OTP Verification',
        status: 'success',
        response: response
      });
      
    } catch (error: any) {
      addResult({
        timestamp: new Date().toLocaleTimeString(),
        phoneNumber,
        endpoint: 'OTP Verification',
        status: 'error',
        error: error.message || 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const phoneValidation = testPhoneFormat(phoneNumber);
  const isValidPhone = phoneValidation.some(p => p.valid);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-teal-700">
              📱 SMS Delivery Diagnostic Tool
            </CardTitle>
            <CardDescription>
              Test SMS delivery to Twilio production numbers and diagnose delivery issues
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Phone Number Input */}
        <Card>
          <CardHeader>
            <CardTitle>Phone Number Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="tel"
                placeholder="+15878881837"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Badge variant={isValidPhone ? "default" : "destructive"}>
                {isValidPhone ? "Valid" : "Invalid"}
              </Badge>
            </div>
            
            {/* Phone Format Validation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {phoneValidation.map((format, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Badge variant={format.valid ? "default" : "outline"} className="text-xs">
                    {format.name}
                  </Badge>
                  <span className={format.valid ? "text-green-600" : "text-gray-500"}>
                    {format.valid ? "✓" : "✗"}
                  </span>
                </div>
              ))}
            </div>

            {/* Twilio Test Numbers */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Twilio Test Numbers:</h4>
              <div className="space-y-1 text-sm">
                <div>• Development: +1 587 888 1837 (Testing number)</div>
                <div>• Production: User-entered phone numbers from registration</div>
                <div>• Success Test: +15005550006 (Always succeeds)</div>
                <div>• Failure Test: +15005550001 (Always fails)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>SMS Delivery Tests</CardTitle>
            <CardDescription>
              Test different SMS delivery scenarios with the configured phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={testRegistrationSMS}
                disabled={isLoading || !isValidPhone}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Test Registration SMS
              </Button>
              
              <Button 
                onClick={testPasswordResetSMS}
                disabled={isLoading || !isValidPhone}
                variant="outline"
              >
                Test Password Reset SMS
              </Button>
              
              <Button 
                onClick={testOTPVerification}
                disabled={isLoading || !isValidPhone}
                variant="outline"
              >
                Test OTP Verification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Latest SMS delivery test results and diagnostic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tests run yet. Click a test button above to begin.
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((result, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          result.status === 'success' ? 'default' : 
                          result.status === 'error' ? 'destructive' : 'secondary'
                        }>
                          {result.status}
                        </Badge>
                        <span className="font-medium">{result.endpoint}</span>
                      </div>
                      <span className="text-sm text-gray-500">{result.timestamp}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div><strong>Phone:</strong> {result.phoneNumber}</div>
                      {result.deliveryTime && (
                        <div><strong>Response Time:</strong> {result.deliveryTime}ms</div>
                      )}
                      {result.error && (
                        <div className="text-red-600"><strong>Error:</strong> {result.error}</div>
                      )}
                      {result.response && (
                        <details className="bg-gray-50 p-2 rounded">
                          <summary className="cursor-pointer font-medium">API Response</summary>
                          <pre className="mt-2 text-xs overflow-auto">
                            {JSON.stringify(result.response, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Troubleshooting Guide */}
        <Card>
          <CardHeader>
            <CardTitle>SMS Troubleshooting Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Common SMS Delivery Issues:</h4>
              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                <li>• Phone number not verified in Twilio trial account</li>
                <li>• Carrier blocking promotional messages</li>
                <li>• Invalid phone number format (must be E.164)</li>
                <li>• Twilio account suspended or rate limited</li>
                <li>• CORS blocking API requests (check console logs)</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Next Steps for SMS Issues:</h4>
              <ol className="space-y-1 text-sm text-gray-600 ml-4">
                <li>1. Check Twilio Console logs for delivery status</li>
                <li>2. Verify phone number is added to Twilio verified list</li>
                <li>3. Test with Twilio magic numbers first</li>
                <li>4. Contact Twilio support with account SID and error details</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}