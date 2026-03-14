function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (!input.startsWith("+")) {
    return `+${digits}`;
  }

  return input;
}

export async function startOtp(phone: string) {
  const res = await fetch("/api/auth/request-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ phone: normalizePhone(phone) })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OTP request failed ${res.status}: ${text}`);
  }

  return await res.json();
}

export async function requestOtp(phone: string) {
  return startOtp(phone);
}

export async function verifyOtp(phone: string, code: string) {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ phone: normalizePhone(phone), code })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OTP verify failed ${res.status}: ${text}`);
  }

  const data = await res.json();

  const token = data?.token || data?.sessionToken;
  if (token && typeof localStorage !== "undefined") {
    const session = {
      token,
      phone,
      authenticated: true,
      createdAt: Date.now()
    };

    localStorage.setItem("client_session", JSON.stringify(session));
  }

  return data;
}
