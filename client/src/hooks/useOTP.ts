import { useCallback, useState } from 'react';

type OTPStatus = 'idle' | 'requesting' | 'verifying' | 'success' | 'error';

interface OTPResult {
  status: OTPStatus;
  error?: string;
}

const isBrowser = typeof window !== 'undefined';

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function useOTP() {
  const [state, setState] = useState<OTPResult>({ status: 'idle' });

  const requestCode = useCallback(async (phone: string) => {
    const sanitized = phone.trim();
    if (!sanitized) {
      setState({ status: 'error', error: 'Phone number is required.' });
      return;
    }

    setState({ status: 'requesting' });

    try {
      await postJSON('/api/otp/request', { phone: sanitized });
      setState({ status: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request code.';
      setState({ status: 'error', error: message });
    }
  }, []);

  const verifyCode = useCallback(async (phone: string, code: string) => {
    const sanitizedPhone = phone.trim();
    const sanitizedCode = code.trim();

    if (!sanitizedPhone || sanitizedCode.length !== 6) {
      setState({ status: 'error', error: 'Provide phone number and 6-digit code.' });
      return false;
    }

    setState({ status: 'verifying' });

    try {
      const result = await postJSON<{ token: string }>('/api/otp/verify', {
        phone: sanitizedPhone,
        code: sanitizedCode,
      });

      if (isBrowser) {
        window.sessionStorage?.setItem('otp_token', result.token);
      }

      setState({ status: 'success' });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Code verification failed.';
      setState({ status: 'error', error: message });
      return false;
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return {
    status: state.status,
    error: state.error,
    requestCode,
    verifyCode,
    reset,
  };
}

export type UseOTPReturn = ReturnType<typeof useOTP>;
