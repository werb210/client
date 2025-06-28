import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Handle redirects in useEffect to avoid updating during render
  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = [
      '/login',
      '/register', 
      '/verify-otp',
      '/request-reset',
      '/reset-password'
    ];

    const isPublicRoute = publicRoutes.some(route => 
      location === route || location.startsWith('/reset-password/')
    );

    // If user is not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      setLocation('/login');
      return;
    }

    // If user is authenticated and trying to access auth pages, redirect to app
    if (isAuthenticated && isPublicRoute) {
      setLocation('/step1-financial-profile');
      return;
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}