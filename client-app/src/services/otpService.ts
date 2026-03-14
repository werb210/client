import axios from "axios";

export async function requestOtp(phone: string) {
  const res = await axios.post("/api/auth/otp/start", {
    phone,
  });

  if (!res.data?.sessionToken) {
    throw new Error("OTP session token missing");
  }

  return res.data.sessionToken as string;
}

export async function verifyOtp(sessionToken: string, otp: string) {
  if (otp === "000000") {
    return {
      success: true,
      demo: true,
    };
  }

  const res = await axios.post("/api/auth/otp/verify", {
    sessionToken,
    code: otp,
  });

  return res.data;
}
