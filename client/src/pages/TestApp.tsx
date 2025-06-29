export default function TestApp() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1rem'
        }}>
          Boreal Financial - Client Application
        </h1>
        <p style={{
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          Application is loading successfully. React components are rendering correctly.
        </p>
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#374151'
        }}>
          <div><strong>Environment:</strong> Development</div>
          <div><strong>Status:</strong> Active</div>
          <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
        </div>
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#ecfdf5',
          border: '1px solid #d1fae5',
          borderRadius: '4px'
        }}>
          <div style={{ color: '#065f46', fontWeight: '500' }}>
            Draft-Before-Sign Flow Implemented
          </div>
          <div style={{ color: '#047857', fontSize: '14px', marginTop: '0.5rem' }}>
            SignNow integration, Applications API, and complete workflow ready for testing
          </div>
        </div>
      </div>
    </div>
  );
}