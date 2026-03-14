// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { PhoneInput } from "../components/ui/PhoneInput";
import { PrimaryButton } from "../components/ui/Button";
import { OtpInput } from "../components/OtpInput";
import { ClientProfileStore } from "../state/clientProfiles";
import { formatPhoneNumber, getCountryCode } from "../utils/location";
import { resolveOtpNextStep } from "../auth/otp";
import { clearServiceWorkerCaches } from "../pwa/serviceWorker";
import { components, layout, scrollToFirstError } from "@/styles";
import { startOtp, verifyOtp } from "@/services/otpService";
import { setToken } from "@/auth/tokenStorage";
import { ensureClientSession, setActiveClientSessionToken } from "@/state/clientSession";

export function PortalEntry() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [serverCode, setServerCode] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const countryCode = useMemo(() => getCountryCode("United States"), []);

  useEffect(() => {
    const lastPhone = ClientProfileStore.getLastUsedPhone();
    if (lastPhone) {
      setPhone(lastPhone);
    }
  }, []);

  useEffect(() => {
    if (phoneError || otpError) {
      scrollToFirstError();
    }
  }, [otpError, phoneError]);

  async function handleSendCode() {
    const normalized = phone.trim();
    if (!normalized) {
      setPhoneError("Enter the phone number used for your application.");
      return;
    }
    setPhoneError("");
    setServerCode("");
    setOtpCode("");

    try {
      await startOtp(normalized);
      setOtpRequested(true);
    } catch (error) {
      setPhoneError("Unable to send code. Please try again.");
    }
  }

  async function handleVerify(code: string) {
    try {
      setOtpError("");
      const normalizedPhone = phone.trim();
      const response = await verifyOtp(normalizedPhone, code);
      const result = response?.data;

      if (!result?.success || !result?.sessionToken) {
        setOtpError("Invalid code");
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
      const nextStep = resolveOtpNextStep(ClientProfileStore.getProfile(normalizedPhone));

      if (nextStep.action === "start") {
        navigate("/dashboard");
        return;
      }

      if (nextStep.action === "resume") {
        navigate(`/continue/${nextStep.token}`);
        return;
      }

      const token = nextStep.token;
      const profile = ClientProfileStore.getProfile(normalizedPhone);
      const applicationTokens = profile?.applicationTokens || [];
      applicationTokens.forEach((entry) => ClientProfileStore.markPortalVerified(entry));
      ClientProfileStore.markPortalVerified(token);
      clearServiceWorkerCaches("otp").finally(() => {
        navigate(`/status?token=${token}`);
      });
    } catch (err) {
      setOtpError("OTP verification failed");
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

          {!otpRequested ? (
            <>
              <div style={layout.stackTight} data-error={Boolean(phoneError)}>
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
                  hasError={Boolean(phoneError)}
                  onKeyDown={(event: unknown) => {
                    if (event.key === "Enter") {
                      handleSendCode();
                    }
                  }}
                />
                {phoneError && (
                  <div style={components.form.errorText} data-error={true}>
                    {phoneError}
                  </div>
                )}
              </div>

              <PrimaryButton style={{ width: "100%" }} onClick={handleSendCode}>
                Send code
              </PrimaryButton>
            </>
          ) : (
            <div style={layout.stackTight}>
              <div style={components.form.helperText}>
                Enter the 6-digit code sent to your phone.
              </div>
              {serverCode && (
                <div style={components.form.helperText} data-testid="server-demo-code">
                  Demo code: {serverCode}
                </div>
              )}
              <OtpInput length={6} onComplete={handleOtpComplete} />
              <PrimaryButton style={{ width: "100%" }} onClick={() => handleVerify(otpCode)}>
                Verify code
              </PrimaryButton>
              {otpError && (
                <div style={components.form.errorText} data-error={true}>
                  {otpError}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
