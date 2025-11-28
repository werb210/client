import { useState } from "react";
import { verifyOtp } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await verifyOtp({ email, otp });

      if (result.applicationStatus === "not_started") {
        nav("/step-1");
      } else if (result.applicationStatus === "in_progress") {
        nav("/step-1");
      } else {
        nav("/portal");
      }
    } catch (err: any) {
      setError("Invalid code. Try again.");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Verify Code</h1>

      <form onSubmit={submit} className="space-y-4">
        {error && <div className="text-red-500">{error}</div>}

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="border p-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">6-Digit Code</label>
          <input
            type="text"
            maxLength={6}
            className="border p-2 w-full tracking-widest text-center"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </form>
    </div>
  );
}

