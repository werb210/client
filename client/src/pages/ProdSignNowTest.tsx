import { useEffect, useState } from 'react';

export default function ProdSignNowTest() {
  const [appId, setAppId] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('applicationId');
    setAppId(id);

    if (id) {
      testSignNowEndpoint(id);
    }
  }, []);

  const testSignNowEndpoint = async (testId: string) => {
    setLoading(true);
    setResponse(null);
    
    try {
      // PRODUCTION DEBUG LOGGING - matching Step 6 format
      console.log("🔍 PRODUCTION DEBUG - Environment Variables (Test Page):");
      console.log("   - window.location.origin:", window.location.origin);
      console.log("   - VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
      console.log("   - VITE_STAFF_API_URL:", import.meta.env.VITE_STAFF_API_URL);
      console.log("   - Has AUTH TOKEN:", import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN ? 'YES' : 'NO');
      
      console.log('🔍 Testing SignNow with applicationId:', testId);
      
      const signNowEndpoint = `/api/applications/${testId}/signnow`;
      const fullUrl = `${window.location.origin}${signNowEndpoint}`;
      
      console.log("🔍 PRODUCTION DEBUG - Test API Call Details:");
      console.log(`   - SignNow endpoint: ${signNowEndpoint}`);
      console.log(`   - Full URL: ${fullUrl}`);
      console.log(`   - Should be calling: ${window.location.origin} (local proxy)`);
      console.log(`   - NOT calling: https://staff.boreal.financial (direct)`);
      
      const response = await fetch(signNowEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify({ applicationId: testId }),
        credentials: 'include'
      });
      
      console.log("🔍 PRODUCTION DEBUG - Test Response Status:", response.status);
      console.log("🔍 PRODUCTION DEBUG - Test Response OK:", response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log("🔍 PRODUCTION DEBUG - Test SignNow Response:", data);
        setResponse(data);
        console.log('✅ SignNow test successful:', data);
      } else {
        const error = await response.text();
        console.log("🔍 PRODUCTION DEBUG - Test Error Response:", error);
        setResponse({ error: `${response.status}: ${error}` });
        console.error('❌ SignNow test failed:', error);
      }
    } catch (error) {
      console.error('🔍 PRODUCTION DEBUG - Test SignNow request failed:', error);
      
      // Check if this is a network error (CORS, unreachable endpoint)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('🔍 PRODUCTION DEBUG - This is a network error, likely CORS or unreachable endpoint');
        setResponse({ error: 'Network error: Cannot reach SignNow service. Check console for details.' });
      } else {
        setResponse({ error: `Network error: ${error}` });
      }
      console.error('❌ SignNow test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testManualId = () => {
    const manualId = prompt('Enter applicationId to test:');
    if (manualId) {
      setAppId(manualId);
      testSignNowEndpoint(manualId);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>🧪 Production SignNow Debug</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>📦 Local Storage Check</h2>
        <p><strong>applicationId:</strong> {appId || 'NOT FOUND'}</p>
        <p><strong>appId (backup):</strong> {localStorage.getItem('appId') || 'NOT FOUND'}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>🌐 Staff Backend Test</h2>
        {loading && <p>⏳ Testing SignNow endpoint...</p>}
        {response && (
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={testManualId}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Manual Application ID
        </button>
      </div>

      <div style={{ fontSize: '0.9rem', color: '#666' }}>
        <h3>Debug Info:</h3>
        <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
        <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL}</p>
        <p><strong>Has Auth Token:</strong> {import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN ? 'YES' : 'NO'}</p>
      </div>
    </div>
  );
}