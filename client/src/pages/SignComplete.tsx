import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function SignComplete() {
  const [location, navigate] = useLocation();
  
  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const appId = urlParams.get('app');

    // Immediately route to document-upload step
    if (appId) {
      navigate(`/upload-documents?app=${appId}`, { replace: true });
    } else {
      // Fallback if no app ID provided
      navigate('/dashboard', { replace: true });
    }
  }, [location, navigate]);

  return <p className="text-center mt-10">Redirecting…</p>;
}