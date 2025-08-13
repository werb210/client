import React, { createContext, useContext, useEffect, useState } from "react";
import { apiCall } from "../lib/api";

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
    try { 
      const data = await apiCall<{ ok: boolean; user?: User }>("/api/auth/user");
      setUser(data?.ok ? data.user || null : null); 
    }
    catch { setUser(null); } 
    finally { setLoading(false); }
  }
  
  useEffect(() => { load(); }, []);
  
  async function login(email: string, password: string) {
    const data = await apiCall<{ success: boolean; error?: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!data?.success) throw new Error(data?.error || "LOGIN_FAILED");
    return { mfa: "required" as const };
  }
  
  async function requestOtp(email: string) {
    const data = await apiCall<{ success: boolean; message?: string; cooldownSeconds?: number; debugCode?: string }>("/api/auth/request-2fa", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!data?.success) throw new Error(data?.message || "OTP_SEND_FAILED");
    return { cooldownSeconds: data.cooldownSeconds, debugCode: data.debugCode };
  }
  
  async function verifyOtp(email: string, code: string) {
    const data = await apiCall<{ success: boolean; message?: string; user?: User }>("/api/auth/verify-2fa", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    if (!data?.success) throw new Error(data?.message || "OTP_VERIFY_FAILED");
    await load();
  }
  
  async function logout() { 
    await apiCall("/api/auth/logout", { method: "POST" }); 
    setUser(null); 
  }
  
  return <C.Provider value={{ user, loading, login, requestOtp, verifyOtp, logout }}>{children}</C.Provider>;
};