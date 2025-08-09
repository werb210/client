import React, { useEffect, useState } from 'react';
import { fetchMe } from '../api/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await fetchMe();
        setUser(userData);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login or show login form
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Please Sign In</h2>
            <p className="text-gray-600 mb-4">You need to be authenticated to access this area.</p>
            <p className="text-sm text-gray-500">
              On iPad, if you're in an embedded view, tap 'Open in New Tab' to sign in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}