// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { PhoneInput } from "../components/ui/PhoneInput";
import { PrimaryButton } from "../components/ui/Button";
import { OtpInput } from "../components/OtpInput";
import { ClientProfileStore } from "../state/clientProfiles";
import { formatPhoneNumber, getCountryCode } from "../utils/location";
import { components, layout, scrollToFirstError } from "@/styles";
import { startOtp, verifyOtp } from "@/services/otpService";
import { setToken } from "@/auth/tokenStorage";
import { ensureClientSession, setActiveClientSessionToken } from "@/state/clientSession";

export function PortalEntry() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState("");
  const [otpCode, setOtpCode] = useState("");
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

    try {
      await startOtp(normalized);
      setStep("otp");
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

  async function handleVerify(code: string) {
    setError("");

    try {
      const normalizedPhone = phone.trim();
      const result = await verifyOtp(normalizedPhone, code);

      if (!result?.success || !result?.sessionToken) {
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
    }
  }

  async function handleOtpComplete(code: string) {
    setOtpCode(code);
    await handleVerify(code);
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
                  onChange={(event: unknown) =>
                    setPhone(formatPhoneNumber(event.target.value, countryCode))
                  }
                  placeholder="(555) 555-5555"
                  hasError={Boolean(error)}
                  onKeyDown={(event: unknown) => {
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
              <OtpInput length={6} onComplete={handleOtpComplete} />
              <PrimaryButton style={{ width: "100%" }} onClick={() => handleVerify(otpCode)}>
                Verify code
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
