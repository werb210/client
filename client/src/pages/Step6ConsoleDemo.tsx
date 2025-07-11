import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Step6ConsoleDemo() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runStep6SignNowTest = async () => {
    setIsLoading(true);
    setTestResult('');
    
    // Generate test UUID
    const testApplicationId = crypto.randomUUID();
    
    // Store in localStorage (simulating Step 4)
    localStorage.setItem('applicationId', testApplicationId);
    
    console.log('🚀 Triggered createSignNowDocument()');
    console.log('🌍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('🆔 Application ID:', testApplicationId);
    
    const signNowUrl = `${import.meta.env.VITE_API_BASE_URL}/applications/${testApplicationId}/signnow`;
    console.log('📡 Calling SignNow endpoint:', signNowUrl);
    
    try {
      const response = await fetch(signNowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('📬 SignNow response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SignNow error body:', errorText);
        setTestResult(`Response: ${response.status} - ${errorText}`);
      } else {
        const json = await response.json();
        console.log('✅ SignNow response JSON:', json);
        setTestResult(`Success: ${JSON.stringify(json, null, 2)}`);
      }
    } catch (err: any) {
      console.error('❌ SignNow fetch failed:', err);
      setTestResult(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Step 6 SignNow Console Output Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Expected Console Output:</h3>
            <pre className="text-sm overflow-x-auto">
{`🚀 Triggered createSignNowDocument()
🌍 VITE_API_BASE_URL: ${import.meta.env.VITE_API_BASE_URL}
🆔 Application ID: [UUID]
📡 Calling SignNow endpoint: ${import.meta.env.VITE_API_BASE_URL}/applications/[UUID]/signnow
📬 SignNow response status: 404`}
            </pre>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Network Tab Instructions:</h3>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Open browser DevTools (F12)</li>
              <li>Go to Network tab</li>
              <li>Filter by "signnow"</li>
              <li>Click the button below</li>
              <li>Observe POST request to SignNow endpoint</li>
              <li>Check request headers and response code</li>
            </ol>
          </div>

          <Button 
            onClick={runStep6SignNowTest}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing SignNow Endpoint...' : 'Trigger Step 6 SignNow Test'}
          </Button>

          {testResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">API Response:</h3>
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Verification Checklist:</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>✅ Console shows "🚀 Triggered createSignNowDocument()"</li>
              <li>✅ Console shows "🌍 VITE_API_BASE_URL: https://staffportal.replit.app/api"</li>
              <li>✅ Console shows "🆔 Application ID: [UUID]"</li>
              <li>✅ Console shows "📡 Calling SignNow endpoint: [URL]"</li>
              <li>✅ Network tab shows POST request</li>
              <li>✅ Request headers include Content-Type: application/json</li>
              <li>✅ Response code: 404 (expected for test UUID)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}