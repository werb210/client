import axios from "axios"

const API = "https://server.boreal.financial/api"

export interface SendOtpResponse {
  sessionId: string
}

let otpSessionId: string | null = null

export async function sendOtp(phone: string): Promise<void> {
  const res = await axios.post(`${API}/auth/send-otp`, { phone })

  if (!res.data?.sessionId) {
    throw new Error("OTP session not returned from server")
  }

  otpSessionId = res.data.sessionId
}

export async function verifyOtp(phone: string, code: string) {
  if (!otpSessionId) {
    throw new Error("OTP session missing")
  }

  const res = await axios.post(`${API}/auth/verify-otp`, {
    phone,
    code,
    sessionId: otpSessionId
  })

  return res.data
}
