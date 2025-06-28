import { useLocation } from 'wouter';

export function useInitialAuthRedirect() {
  const [, setLocation] = useLocation();

  const handleAuthRedirect = () => {
    try {
      const userEmail = localStorage.getItem('user-email');
      
      if (!userEmail) {
        // New user - redirect to register
        setLocation('/register');
      } else {
        // Returning user - redirect to login
        setLocation('/login');
      }
    } catch (error) {
      // Fallback if localStorage fails - redirect to register (safe default)
      console.warn('localStorage access failed, defaulting to register');
      setLocation('/register');
    }
  };

  return { handleAuthRedirect };
}