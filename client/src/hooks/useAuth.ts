import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";

interface TwoFactorStatus {
  is2FAEnabled: boolean;
  phoneNumber?: string;
  twoFactorComplete: boolean;
}

export function useAuth() {
  // Note: These queries will now route through staff backend API
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: twoFactorStatus, isLoading: is2FALoading } = useQuery<TwoFactorStatus>({
    queryKey: ["/api/2fa/status"],
    enabled: !!user,
    retry: false,
  });

  // For client app, assume user data comes from staff backend
  // Client app will redirect to staff login if needed
  const needsRegistration = false; // Staff backend handles registration
  const needs2FA = false; // Staff backend handles 2FA
  
  return {
    user,
    twoFactorStatus,
    isLoading: isLoading || is2FALoading,
    isAuthenticated: !!user,
    needsRegistration,
    needs2FA,
    is2FAComplete: true, // Assume complete if user exists in client
  };
}
