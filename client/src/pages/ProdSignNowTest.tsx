import { useEffect, useState } from 'react';

export default function ProdSignNowTest() {
  const [appId, setAppId] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('applicationId');
    setAppId(id);

    if (id) {
      setLoading(true);
      // Use local proxy to avoid CORS issues
      fetch(`/api/applications/${id}/signnow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setResponse(data);
          setLoading(false);
        })
        .catch((err) => {
          setResponse({ error: err.message });
          setLoading(false);
        });
    }
  }, []);

  const testManualId = () => {
    const manualId = prompt('Enter applicationId to test:');
    if (manualId) {
      setLoading(true);
      // Use local proxy to avoid CORS issues
      fetch(`/api/applications/${manualId}/signnow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setResponse(data);
          setLoading(false);
        })
        .catch((err) => {
          setResponse({ error: err.message });
          setLoading(false);
        });
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