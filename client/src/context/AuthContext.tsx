import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fallbackApi } from '@/lib/fallbackApi';
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

  // Fetch user on app boot
  useEffect(() => {
    fetchUser().catch(() => {
      // Silently handle auth check failures
      setUser(null);
      setIsLoading(false);
    });
  }, []);

  const fetchUser = async () => {
    try {
      const result = await fallbackApi.getCurrentUser();
      
      if (result.success && result.data) {
        setUser(result.data);
      } else {
        setUser(null);
        if (result.fallback) {
          console.log('Staff backend unreachable, user logged out locally');
        }
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; otpRequired?: boolean }> => {
    try {
      const result = await fallbackApi.login(email, password);
      
      if (!result.success) {
        console.error('Login failed:', result.error);
        return { success: false };
      }

      // Staff backend always sends OTP for login
      if (result.data?.message === "OTP sent" || result.data?.otpRequired) {
        return { success: true, otpRequired: true };
      } else {
        // Direct authentication (fallback)
        await fetchUser(); // Refresh user data
        return { success: true, otpRequired: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const result = await fallbackApi.logout();
      if (result.fallback) {
        console.log('Logged out locally (staff backend unreachable)');
      }
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