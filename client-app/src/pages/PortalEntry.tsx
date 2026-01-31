import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { OtpInput } from "../components/OtpInput";
import { ClientProfileStore } from "../state/clientProfiles";
import { formatPhoneNumber, getCountryCode } from "../utils/location";
import { theme } from "../styles/theme";

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
    const token =
      ClientProfileStore.getLatestSubmittedToken(phone) ||
      ClientProfileStore.getLatestToken(phone);
    if (!token) {
      setOtpError("We couldn't find an application for this number.");
      return;
    }
    ClientProfileStore.markPortalVerified(token);
    navigate(`/status?token=${token}`);
  }

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <Card className="space-y-4">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Client portal
            </div>
            <h1 className="text-2xl font-semibold text-borealBlue mt-2">
              Verify your phone
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              We send a new one-time passcode every time you visit your portal.
            </p>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="portal-phone"
              style={{
                fontSize: theme.typography.label.fontSize,
                fontWeight: theme.typography.label.fontWeight,
                color: theme.colors.textSecondary,
              }}
            >
              Phone number
            </label>
            <Input
              id="portal-phone"
              value={formatPhoneNumber(phone, countryCode)}
              onChange={(event: any) =>
                setPhone(formatPhoneNumber(event.target.value, countryCode))
              }
              placeholder="(555) 555-5555"
              onKeyDown={(event: any) => {
                if (event.key === "Enter") {
                  handleSendOtp();
                }
              }}
            />
            {phoneError && (
              <div className="text-sm text-red-600">{phoneError}</div>
            )}
          </div>

          {!showOtp && (
            <Button className="w-full" onClick={handleSendOtp}>
              Send code
            </Button>
          )}

          {showOtp && (
            <div className="space-y-3">
              <div className="text-sm text-slate-500">
                Enter the 6-digit code sent to your phone.
              </div>
              <OtpInput onComplete={handleVerify} />
              {otpHint && (
                <div className="text-xs text-slate-400">
                  Demo OTP: {otpHint}
                </div>
              )}
              {otpError && (
                <div className="text-sm text-red-600">{otpError}</div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
