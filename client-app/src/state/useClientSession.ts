import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ClientSessionState {
  email: string | null;
  token: string | null;
  applicationId: string | null;
  setSession: (data: {
    email: string;
    token: string;
    applicationId: string;
  }) => void;
  clear: () => void;
}

const getInitialValue = (key: string) => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

export const useClientSession = create<ClientSessionState>()(
  persist(
    (set) => ({
      email: getInitialValue("clientEmail"),
      token: getInitialValue("clientToken"),
      applicationId: getInitialValue("applicationId"),

      setSession: ({ email, token, applicationId }) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("clientEmail", email);
          localStorage.setItem("clientToken", token);
          localStorage.setItem("applicationId", applicationId);
        }

        set({ email, token, applicationId });
      },

      clear: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("clientEmail");
          localStorage.removeItem("clientToken");
          localStorage.removeItem("applicationId");
        }

        set({ email: null, token: null, applicationId: null });
      }
    }),
    { name: "client-session" }
  )
);
