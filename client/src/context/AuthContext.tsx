import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthAPI } from '@/lib/authApi';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; otpRequired?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Skip initial user fetch - only authenticate when user attempts login
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const fetchUser = async () => {
    try {
      const response = await AuthAPI.getCurrentUser();
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      // Silently handle auth errors - CORS issues are expected
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; otpRequired?: boolean }> => {
    try {
      const response = await AuthAPI.login({ email, password });
      
      if (response.status === 503 || response.status === 502) {
        // Backend connectivity or configuration issue
        console.warn('Staff backend unavailable - authentication requires backend connection');
        return { success: false };
      }
      
      if (!response.ok) {
        console.error('Login failed:', response.status);
        return { success: false };
      }

      // Safely parse JSON response from staff backend
      let result;
      try {
        result = await response.json();
        await fetchUser();
        return { success: true, otpRequired: false };
      } catch (jsonError) {
        console.error('Invalid JSON response from staff backend - HTML received instead');
        return { success: false };
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Login error:', error.message);
      } else {
        console.error('Login error: Unknown error occurred');
      }
      return { success: false };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Clear any stored session data
      sessionStorage.removeItem('otpEmail');
      sessionStorage.removeItem('otpPhone');
      
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    }
  };

  const refreshUser = async (): Promise<void> => {
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}