import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

// 1: Request OTP
export async function requestOTP(email: string, phone: string) {
  return axios.post(`${API_BASE}/auth/request-otp`, { email, phone });
}

// 2: Verify OTP
export async function verifyOTP(email: string, otp: string) {
  return axios.post(`${API_BASE}/auth/verify-otp`, { email, otp });
}

// 3: Fetch existing user application (if they return later)
export async function fetchUserState(token: string) {
  return axios.get(`${API_BASE}/auth/state`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
