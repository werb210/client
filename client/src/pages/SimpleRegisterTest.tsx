import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SimpleRegisterTest() {
  const [email, setEmail] = useState('test@example.com');
  const [phone, setPhone] = useState('+15878881837');
  const [password, setPassword] = useState('testpass123');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const { toast } = useToast();

  const testRegistration = async () => {
    setIsLoading(true);
    setResponse('');

    try {
      const API_URL = 'https://staffportal.replit.app/api';
      
      const requestData = {
        email,
        phone,
        password
      };

      // console.log('Testing registration with:', requestData);
      
      const fetchResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(requestData)
      });

      // console.log('Response status:', fetchResponse.status);
      // console.log('Response headers:', Object.fromEntries(fetchResponse.headers.entries()));

      const responseText = await fetchResponse.text();
      // console.log('Response body:', responseText);

      setResponse(`
Status: ${fetchResponse.status} ${fetchResponse.statusText}
Headers: ${JSON.stringify(Object.fromEntries(fetchResponse.headers.entries()), null, 2)}
Body: ${responseText}
      `);

      if (fetchResponse.ok) {
        toast({
          title: 'Registration Successful',
          description: 'Check the response details below',
        });
      } else {
        toast({
          title: 'Registration Failed',
          description: `Status: ${fetchResponse.status}`,
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Registration error:', error);
      setResponse(`Error: ${error}`);
      toast({
        title: 'Network Error',
        description: 'Unable to connect to server',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Simple Registration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            onClick={testRegistration} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Registration'}
          </Button>

          {response && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Response:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {response}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}