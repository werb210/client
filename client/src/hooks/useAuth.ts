import { useQuery } from "@tanstack/react-query";

interface TwoFactorStatus {
  is2FAEnabled: boolean;
  phoneNumber?: string;
  twoFactorComplete: boolean;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: twoFactorStatus, isLoading: is2FALoading } = useQuery<TwoFactorStatus>({
    queryKey: ["/api/2fa/status"],
    enabled: !!user,
    retry: false,
  });

  // Determine if user needs to register (missing essential info)
  const needsRegistration = !!user && (!(user as any).firstName || !(user as any).lastName || !(user as any).phoneNumber);
  
  // Determine if user needs 2FA (has registered but not completed 2FA)
  const needs2FA = !!user && !needsRegistration && (!twoFactorStatus?.twoFactorComplete);

  return {
    user,
    twoFactorStatus,
    isLoading: isLoading || is2FALoading,
    isAuthenticated: !!user,
    needsRegistration,
    needs2FA,
    is2FAComplete: twoFactorStatus?.twoFactorComplete || false,
  };
}
