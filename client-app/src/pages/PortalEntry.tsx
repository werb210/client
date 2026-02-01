import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { PhoneInput } from "../components/ui/PhoneInput";
import { PrimaryButton } from "../components/ui/Button";
import { OtpInput } from "../components/OtpInput";
import { ClientProfileStore } from "../state/clientProfiles";
import { formatPhoneNumber, getCountryCode } from "../utils/location";
import { resolveOtpNextStep } from "../auth/otp";
import { components, layout, scrollToFirstError, tokens } from "@/styles";

export function PortalEntry() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpHint, setOtpHint] = useState("");
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

  function handleSendOtp() {
    const normalized = phone.trim();
    if (!normalized) {
      setPhoneError("Enter the phone number used for your application.");
      return;
    }
    setPhoneError("");
    const code = ClientProfileStore.requestOtp(normalized);
    setOtpHint(code);
    setShowOtp(true);
  }

  function handleVerify(code: string) {
    setOtpError("");
    if (!ClientProfileStore.verifyOtp(phone, code)) {
      setOtpError("Incorrect code. Please try again.");
      return;
    }
    ClientProfileStore.setLastUsedPhone(phone);
    const nextStep = resolveOtpNextStep(ClientProfileStore.getProfile(phone));
    const token =
      nextStep.action === "portal" || nextStep.action === "resume"
        ? nextStep.token
        : "";
    if (!token) {
      setOtpError("We couldn't find an application for this number.");
      return;
    }
    ClientProfileStore.markPortalVerified(token);
    navigate(`/status?token=${token}`);
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
              onChange={(event: any) =>
                setPhone(formatPhoneNumber(event.target.value, countryCode))
              }
              placeholder="(555) 555-5555"
              hasError={Boolean(phoneError)}
              onKeyDown={(event: any) => {
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
              {otpHint && (
                <div style={{ ...components.form.helperText, color: tokens.colors.textSecondary }}>
                  Demo OTP: {otpHint}
                </div>
              )}
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
