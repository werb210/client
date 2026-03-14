const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";

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
  const payload = {
    phone: String(phone).trim(),
    code: String(code).trim()
  };

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `OTP verification failed (${response.status})`);
  }

  return response.json();
}
