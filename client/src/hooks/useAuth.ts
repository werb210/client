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

  return {
    user,
    twoFactorStatus,
    isLoading: isLoading || is2FALoading,
    isAuthenticated: !!user,
    is2FAComplete: twoFactorStatus?.twoFactorComplete || false,
    needs2FA: !!user && (!twoFactorStatus?.twoFactorComplete),
  };
}
