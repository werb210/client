import React, { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  onVerify: (email: string, code: string) => Promise<void>;
  onResend?: (email: string) => Promise<void>;
  title?: string;
  description?: string;
  length?: number;
  className?: string;
}

export function OTPVerification({
  email,
  onVerify,
  onResend,
  title = "Enter Verification Code",
  description = "We sent a 6-digit code to your email",
  length = 6,
  className = ""
}: OTPVerificationProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async () => {
    // Input sanitation: clean the code and validate
    const clean = (code || "").toString().trim().replace(/\D/g, "");
    
    if (clean.length !== length) {
      setError(`Please enter the ${length}-digit code.`);
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      // Clean and normalize email
      const cleanEmail = (email || "").trim().toLowerCase();
      await onVerify(cleanEmail, clean);
      setSuccess(true);
    } catch (e: any) {
      // Distinguish different error types for clearer UX
      let msg = "Verification failed. Please try again.";
      
      if (e?.status === 401 || e?.message?.includes("invalid") || e?.message?.includes("expired")) {
        msg = "Invalid or expired code. Request a new one and try again.";
      } else if (e?.status === 429) {
        msg = "Too many attempts. Please wait before trying again.";
      } else if (e?.message?.includes("network") || e?.message?.includes("fetch")) {
        msg = "Network error. Please check your connection and try again.";
      }
      
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!onResend) return;
    
    setError("");
    setSuccess(false);
    
    try {
      const cleanEmail = (email || "").trim().toLowerCase();
      await onResend(cleanEmail);
      setError(""); // Clear any previous errors
      // Optionally show a success message for resend
    } catch (e: any) {
      setError("Failed to resend code. Please try again.");
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    // Clear error when user starts typing
    if (error) setError("");
    if (success) setSuccess(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">
          {description} {email && <span className="font-medium">{email}</span>}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <InputOTP
            maxLength={length}
            value={code}
            onChange={handleCodeChange}
            disabled={submitting || success}
          >
            <InputOTPGroup>
              {Array.from({ length }).map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 text-green-800 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>Code verified successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            onClick={onSubmit}
            disabled={submitting || code.length !== length || success}
            className="w-full"
            size="lg"
          >
            {submitting ? "Verifying..." : "Verify Code"}
          </Button>

          {onResend && (
            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full"
              size="lg"
              disabled={submitting}
            >
              Resend Code
            </Button>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>Didn't receive the code? Check your spam folder or try resending.</p>
      </div>
    </div>
  );
}

export default OTPVerification;