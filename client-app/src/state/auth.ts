import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: unknown;
  setToken: (t: string | null) => void;
  setUser: (u: unknown) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (t) => set({ token: t }),
      setUser: (u) => set({ user: u }),
      logout: () => set({ token: null, user: null })
    }),
    { name: "auth-store" }
  )
);
