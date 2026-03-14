import { useEffect, useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Card } from "../components/ui/Card";
import { PhoneInput } from "../components/ui/PhoneInput";
import { PrimaryButton } from "../components/ui/Button";
import { OtpInput } from "../components/OtpInput";
import { ClientProfileStore } from "../state/clientProfiles";
import { formatPhoneNumber, getCountryCode } from "../utils/location";
import { components, layout, scrollToFirstError } from "@/styles";
import { startOtp, verifyOtp } from "@/services/auth";
import { setToken } from "@/auth/tokenStorage";
import { ensureClientSession, setActiveClientSessionToken } from "@/state/clientSession";

export function PortalEntry() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const countryCode = useMemo(() => getCountryCode("United States"), []);

  useEffect(() => {
    const lastPhone = ClientProfileStore.getLastUsedPhone();
    if (lastPhone) {
      setPhone(lastPhone);
    }
  }, []);

  useEffect(() => {
    if (error) {
      scrollToFirstError();
    }
  }, [error]);

  async function handleSendCode() {
    const normalized = phone.trim();
    if (!normalized || sendingOtp) {
      if (!normalized) {
        setError("Enter the phone number used for your application.");
      }
      return;
    }

    setSendingOtp(true);
    setError("");
    setOtpCode("");
    setVerifying(false);

    try {
      await startOtp(normalized);
      setStep("code");
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setError("Code already sent. Please wait a moment.");
      } else {
        setError("Unable to send code. Please try again.");
      }
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (verifying) {
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const normalizedPhone = phone.trim();
      const code = String(otpCode).trim();
      const result = await verifyOtp(normalizedPhone, code);

      if (!result?.ok || !result?.sessionToken) {
        setError("Invalid code. Please try again.");
        return;
      }

      const sessionToken = result.sessionToken as string;

      setToken(sessionToken);
      setActiveClientSessionToken(sessionToken);
      ensureClientSession({
        submissionId: normalizedPhone,
        accessToken: sessionToken,
      });

      ClientProfileStore.setLastUsedPhone(normalizedPhone);
      window.location.href = "/portal";
    } catch (err) {
      setError("Invalid code. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div style={layout.page}>
      <div style={layout.centerColumn}>
        <Card>
          <div style={layout.stackTight}>
            <div style={components.form.eyebrow}>Client portal</div>
            <h1 style={components.form.title}>Verify your phone</h1>
            <p style={components.form.subtitle}>
              We send a new one-time passcode every time you visit your portal.
            </p>
          </div>

          {step === "phone" ? (
            <>
              <div style={layout.stackTight} data-error={Boolean(error)}>
                <label htmlFor="portal-phone" style={components.form.label}>
                  Phone number
                </label>
                <PhoneInput
                  id="portal-phone"
                  value={formatPhoneNumber(phone, countryCode)}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setPhone(formatPhoneNumber(event.target.value, countryCode))
                  }
                  placeholder="(555) 555-5555"
                  hasError={Boolean(error)}
                  onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter") {
                      handleSendCode();
                    }
                  }}
                />
                {error && (
                  <div style={components.form.errorText} data-error={true}>
                    {error}
                  </div>
                )}
              </div>

              <PrimaryButton style={{ width: "100%" }} onClick={handleSendCode} disabled={sendingOtp}>
                {sendingOtp ? "Sending..." : "Send code"}
              </PrimaryButton>

            </>
          ) : (
            <div style={layout.stackTight}>
              <div style={components.form.helperText}>
                Enter the 6-digit code sent to your phone.
              </div>
              <OtpInput length={6} onComplete={setOtpCode} />
              <PrimaryButton
                style={{ width: "100%" }}
                onClick={handleVerifyOtp}
                disabled={otpCode.length !== 6 || verifying}
              >
                {verifying ? "Verifying..." : "Verify code"}
              </PrimaryButton>
              {error && (
                <div style={components.form.errorText} data-error={true}>
                  {error}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
