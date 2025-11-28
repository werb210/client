import { create } from "zustand";
import { getSession } from "../api/auth";

interface AuthState {
  user: null | {
    email: string;
    phone: string;
    applicationStatus: "not_started" | "in_progress" | "submitted";
  };
  loading: boolean;
  fetchUser: () => Promise<void>;
  clear: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  fetchUser: async () => {
    set({ loading: true });
    const result = await getSession();
    set({ user: result?.user ?? null, loading: false });
  },

  clear: () => set({ user: null })
}));

