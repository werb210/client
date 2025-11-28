import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "../../api/auth";
import { useAuthContext } from "../../context/AuthContext";
import { useSessionStore } from "../../state/sessionStore";

export default function Start() {
  const nav = useNavigate();
  const { setToken, setUser } = useAuthContext();
  const { setSession } = useSessionStore();

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
