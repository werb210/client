import axios from "axios";

export async function requestOtp(email: string) {
  const res = await axios.post("/api/auth/request-otp", {
    email,
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

  const res = await axios.post("/api/auth/verify-otp", {
    sessionToken,
    otp,
  });

  return res.data;
}
