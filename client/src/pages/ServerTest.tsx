export default function ServerTest() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Server Test Page</h1>
      <p>If you can see this page, the React app is loading correctly.</p>
      <p>Current time: {new Date().toISOString()}</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Environment Info:</h3>
        <p>NODE_ENV: {import.meta.env.NODE_ENV}</p>
        <p>DEV: {import.meta.env.DEV ? 'true' : 'false'}</p>
        <p>API Base URL: {import.meta.env.VITE_API_BASE_URL}</p>
      </div>
    </div>
  );
}