import { useState, useCallback } from "react";

interface UseOTPVerificationOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface OTPVerificationState {
  isVerifying: boolean;
  isResending: boolean;
  error: string | null;
  success: boolean;
}

export function useOTPVerification(options: UseOTPVerificationOptions = {}) {
  const [state, setState] = useState<OTPVerificationState>({
    isVerifying: false,
    isResending: false,
    error: null,
    success: false,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearSuccess = useCallback(() => {
    setState(prev => ({ ...prev, success: false }));
  }, []);

  const verify = useCallback(async (
    verifyFn: (email: string, code: string) => Promise<void>,
    email: string,
    code: string
  ) => {
    // Input sanitation
    const cleanCode = (code || "").toString().trim().replace(/\D/g, "");
    const cleanEmail = (email || "").trim().toLowerCase();

    if (cleanCode.length !== 6) {
      const error = "Please enter the 6-digit code.";
      setState(prev => ({ ...prev, error }));
      options.onError?.(error);
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isVerifying: true, 
      error: null, 
      success: false 
    }));

    try {
      await verifyFn(cleanEmail, cleanCode);
      setState(prev => ({ 
        ...prev, 
        isVerifying: false, 
        success: true 
      }));
      options.onSuccess?.();
    } catch (e: any) {
      // Enhanced error handling with clearer UX messages
      let errorMessage = "Verification failed. Please try again.";
      
      if (e?.status === 401 || e?.message?.includes("invalid") || e?.message?.includes("expired")) {
        errorMessage = "Invalid or expired code. Request a new one and try again.";
      } else if (e?.status === 429) {
        errorMessage = "Too many attempts. Please wait before trying again.";
      } else if (e?.message?.includes("network") || e?.message?.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (e?.message) {
        errorMessage = e.message;
      }

      setState(prev => ({ 
        ...prev, 
        isVerifying: false, 
        error: errorMessage 
      }));
      options.onError?.(errorMessage);
    }
  }, [options]);

  const resend = useCallback(async (
    resendFn: (email: string) => Promise<void>,
    email: string
  ) => {
    const cleanEmail = (email || "").trim().toLowerCase();

    setState(prev => ({ 
      ...prev, 
      isResending: true, 
      error: null, 
      success: false 
    }));

    try {
      await resendFn(cleanEmail);
      setState(prev => ({ 
        ...prev, 
        isResending: false 
      }));
    } catch (e: any) {
      const errorMessage = e?.message || "Failed to resend code. Please try again.";
      setState(prev => ({ 
        ...prev, 
        isResending: false, 
        error: errorMessage 
      }));
      options.onError?.(errorMessage);
    }
  }, [options]);

  return {
    ...state,
    verify,
    resend,
    clearError,
    clearSuccess,
  };
}

export default useOTPVerification;