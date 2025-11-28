import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SessionState {
  email: string;
  token: string;
  setSession: (email: string, token: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      email: "",
      token: "",
      setSession: (email, token) => set({ email, token }),
      clearSession: () => set({ email: "", token: "" })
    }),
    { name: "session-store" }
  )
);
