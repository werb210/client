const API_BASE = import.meta.env.VITE_API_URL || "";

export async function startOtp(phone: string) {
  const res = await fetch(`${API_BASE}/api/auth/request-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ phone })
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    throw new Error("Server returned invalid JSON for OTP request");
  }

  if (!res.ok) {
    throw new Error(data?.error || `OTP request failed (${res.status})`);
  }

  return data;
}

export async function verifyOtp(phone: string, code: string) {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ phone, code })
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    throw new Error("Server returned invalid JSON for OTP verification");
  }

  if (!res.ok) {
    throw new Error(data?.error || `OTP verification failed (${res.status})`);
  }

  return data;
}
