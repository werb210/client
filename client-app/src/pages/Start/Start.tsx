import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "../../api/auth";
import { useAuthContext } from "../../context/AuthContext";
import { useSessionStore } from "../../state/sessionStore";
import { useClientSession } from "@/state/useClientSession";
import { apiGetApplicationDraft } from "@/api/application";
import { useApplicationStore } from "@/state/applicationStore";

export default function Start() {
  const nav = useNavigate();
  const { setToken, setUser } = useAuthContext();
  const { setSession } = useSessionStore();
  const { setSession: setClientSession } = useClientSession();
  const { loadServerDraft } = useApplicationStore();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOTP() {
    setLoading(true);
    try {
      await requestOTP(email, phone);
      setOtpStage(true);
    } catch (e) {
      console.error(e);
      alert("Error sending OTP");
    }
    setLoading(false);
  }

  async function confirmOTP() {
    setLoading(true);
    try {
      const { data } = await verifyOTP(email, otp);
      setToken(data.token);
      setUser(data.user);
      setSession(email, data.token);

      const applicationId =
        (data.user as { applicationId?: string })?.applicationId ||
        (data.user as { application?: { id?: string } })?.application?.id ||
        "";

      setClientSession({ email, token: data.token, applicationId });

      try {
        const draft = await apiGetApplicationDraft(data.token);
        if (draft) {
          loadServerDraft(draft);
          const targetStep = draft?.step || 1;
          const routeMap: Record<number, string> = {
            1: "/step3-business",
            2: "/step4-applicant",
            3: "/step5-documents",
            4: "/step6-terms",
          };
          nav(routeMap[targetStep] || "/step3-business");
          return;
        }
      } catch (draftError) {
        console.warn("Unable to load draft", draftError);
      }

      if (data.user.hasSubmittedApp) {
        nav("/portal");
      } else {
        nav("/apply/step-1");
      }
    } catch (e) {
      console.error(e);
      alert("Invalid OTP");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome</h1>

      {!otpStage && (
        <>
          <input
            className="border p-3 w-full mb-3"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="border p-3 w-full mb-3"
            placeholder="Mobile phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            className="bg-borealBlue text-white p-3 rounded w-full"
            onClick={sendOTP}
            disabled={loading}
          >
            Get Login Code
          </button>
        </>
      )}

      {otpStage && (
        <>
          <input
            className="border p-3 w-full mb-3"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            className="bg-borealGreen text-white p-3 rounded w-full"
            onClick={confirmOTP}
            disabled={loading}
          >
            Verify Code
          </button>
        </>
      )}
    </div>
  );
}
