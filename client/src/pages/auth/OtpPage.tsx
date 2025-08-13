import React, { useState } from "react";
import { apiCall } from "../../lib/api";

interface OtpPageProps {
  email: string;
  onSuccess?: () => void;
}

export default function OtpPage({ email, onSuccess }: OtpPageProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "error">("idle");
  const [error, setError] = useState("");

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setStatus("verifying");
    setError("");

    try {
      const resp = await apiCall<{ success: boolean; message?: string; user?: any }>(
        "/api/auth/verify-2fa",
        {
          method: "POST",
          body: JSON.stringify({ email, code }),
        }
      );

      if (resp.success) {
        // Cookie is now set; route to portal/dashboard
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = "/portal";
        }
      } else {
        setStatus("error");
        setError(resp.message || "Invalid code");
      }
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Verification failed");
    }
  }

  async function handleResend() {
    try {
      await apiCall("/api/auth/request-2fa", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setError("");
      // Show success message or feedback
    } catch (err: any) {
      setError(err?.message || "Failed to resend code");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Enter 2FA Code
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a verification code to {email}
          </p>
        </div>
        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          <div>
            <label htmlFor="code" className="sr-only">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoFocus
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={8}
              disabled={status === "verifying"}
            />
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={status === "verifying" || !code.trim()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "verifying" ? "Verifying…" : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Resend Code
            </button>
          </div>

          {status === "error" && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}