import React, { useState } from 'react';

export function SimpleSignNowTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runSignNowTest = async () => {
    setIsLoading(true);
    setTestResult('');
    
    // Generate test UUID and store it
    const testApplicationId = crypto.randomUUID();
    localStorage.setItem('applicationId', testApplicationId);
    
    // STEP 1: Trigger the exact console output
    // console.log('🚀 Triggered createSignNowDocument()');
    // console.log('🌍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    // console.log('🆔 Application ID:', testApplicationId);
    
    const signNowUrl = `${import.meta.env.VITE_API_BASE_URL}/applications/${testApplicationId}/signnow`;
    // console.log('📡 Calling SignNow endpoint:', signNowUrl);
    
    try {
      const response = await fetch(signNowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      // console.log('📬 SignNow response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SignNow error body:', errorText);
        setTestResult(`Response: ${response.status} - ${errorText}`);
      } else {
        const json = await response.json();
        // console.log('✅ SignNow response JSON:', json);
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Step 6 SignNow Console Test</h1>
      
      <div style={{ background: '#f0f0f0', padding: '15px', margin: '20px 0', borderRadius: '5px' }}>
        <h3>Expected Console Output:</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
{`🚀 Triggered createSignNowDocument()
🌍 VITE_API_BASE_URL: ${import.meta.env.VITE_API_BASE_URL}
🆔 Application ID: [UUID]
📡 Calling SignNow endpoint: ${import.meta.env.VITE_API_BASE_URL}/applications/[UUID]/signnow
📬 SignNow response status: 404`}
        </pre>
      </div>
      
      <button 
        onClick={runSignNowTest}
        disabled={isLoading}
        style={{
          background: '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Testing SignNow Endpoint...' : 'Trigger Step 6 SignNow Test'}
      </button>

      {testResult && (
        <div style={{ background: '#f8f9fa', padding: '15px', margin: '20px 0', borderRadius: '5px' }}>
          <h3>API Response:</h3>
          <pre style={{ fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{testResult}</pre>
        </div>
      )}

      <div style={{ background: '#d4edda', padding: '15px', margin: '20px 0', borderRadius: '5px' }}>
        <h3>Verification Instructions:</h3>
        <ol style={{ fontSize: '14px' }}>
          <li>Open browser DevTools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click the button above</li>
          <li>Look for console output with emoji icons</li>
          <li>Go to Network tab and filter by "signnow"</li>
          <li>Verify POST request with proper headers</li>
        </ol>
      </div>
    </div>
  );
}