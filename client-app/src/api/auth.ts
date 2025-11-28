import { api } from "./index";

export const authApi = {
  requestOtp: (email: string, phone: string) =>
    api.post("/auth/client/request-otp", { email, phone }),

  verifyOtp: (email: string, code: string) =>
    api.post("/auth/client/verify-otp", { email, code }),
};
