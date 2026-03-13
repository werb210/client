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
import { verifyOtp, requestOtp } from "@/services/auth";

export function PortalEntry() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [phoneError, setPhoneError] = useState("");
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

  async function handleSendOtp() {
    const normalized = phone.trim();
    if (!normalized) {
      setPhoneError("Enter the phone number used for your application.");
      return;
    }
    setPhoneError("");
    const response = await requestOtp(normalized);
    if (!response?.ok) {
      setPhoneError("Unable to send code. Please try again.");
      return;
    }
    setShowOtp(true);
  }

  async function handleVerify(code: string) {
    setOtpError("");
    const normalizedPhone = phone.trim();
    const response = await verifyOtp(normalizedPhone, code);
    if (!response?.ok) {
      setOtpError("Incorrect code. Please try again.");
      return;
    }
    ClientProfileStore.setLastUsedPhone(normalizedPhone);
    const nextStep = resolveOtpNextStep(ClientProfileStore.getProfile(normalizedPhone));

    if (nextStep.action === "start") {
      navigate("/apply");
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
                  handleSendOtp();
                }
              }}
            />
            {phoneError && (
              <div style={components.form.errorText} data-error={true}>
                {phoneError}
              </div>
            )}
          </div>

          {!showOtp && (
            <PrimaryButton style={{ width: "100%" }} onClick={handleSendOtp}>
              Send code
            </PrimaryButton>
          )}

          {showOtp && (
            <div style={layout.stackTight}>
              <div style={components.form.helperText}>
                Enter the 6-digit code sent to your phone.
              </div>
              <OtpInput onComplete={handleVerify} />
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
