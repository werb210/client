import { useState } from "react";
import { startLogin } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await startLogin({ email, phone });
      nav("/verify");
    } catch (err: any) {
      setError("Unable to start login. Check email and phone.");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Sign In</h1>

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
          <label className="block mb-1">Mobile Phone</label>
          <input
            type="tel"
            className="border p-2 w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Sending Code…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

