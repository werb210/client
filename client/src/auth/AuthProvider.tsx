import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
type User = { id: string; email: string; role: string } | null;
type Ctx = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ mfa: "required" }>;
  requestOtp: (email: string) => Promise<{ cooldownSeconds?: number; debugCode?: string }>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
};
const C = createContext<Ctx>(null as any);
export const useAuth = () => useContext(C);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  async function load() {
    try { const { data } = await api.get("/auth/session"); setUser(data?.ok ? data.user : null); }
    catch { setUser(null); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    if (!data?.ok) throw new Error(data?.error || "LOGIN_FAILED");
    return { mfa: "required" as const };
  }
  async function requestOtp(email: string) {
    const { data } = await api.post("/auth/request-otp", { email });
    if (!data?.ok) throw new Error(data?.message || data?.error || "OTP_SEND_FAILED");
    return { cooldownSeconds: data.cooldownSeconds, debugCode: data.debugCode };
  }
  async function verifyOtp(email: string, code: string) {
    const { data } = await api.post("/auth/verify-otp", { email, code });
    if (!data?.ok) throw new Error(data?.error || "OTP_VERIFY_FAILED");
    await load();
  }
  async function logout() { await api.post("/auth/logout"); setUser(null); }
  return <C.Provider value={{ user, loading, login, requestOtp, verifyOtp, logout }}>{children}</C.Provider>;
};