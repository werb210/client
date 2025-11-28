import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export interface StartLoginPayload {
  email: string;
  phone: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export async function startLogin(payload: StartLoginPayload) {
  const res = await axios.post(`${API_BASE}/auth/start`, payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  const res = await axios.post(`${API_BASE}/auth/verify`, payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function getSession() {
  try {
    const res = await axios.get(`${API_BASE}/auth/session`, {
      withCredentials: true,
    });
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function logout() {
  await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
}

