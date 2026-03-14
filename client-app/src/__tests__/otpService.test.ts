import { afterEach, describe, expect, it, vi } from "vitest";
import { startOtp, verifyOtp } from "../services/otpService";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";

describe("otpService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls request OTP endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as Response);

    await expect(startOtp("+15551112222")).resolves.toEqual({ success: true });

    expect(fetchSpy).toHaveBeenCalledWith(`${API_BASE}/api/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "+15551112222" })
    });
  });

  it("calls verify OTP endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ token: "abc" })
    } as Response);

    await expect(verifyOtp("+15551112222", "123456")).resolves.toEqual({ token: "abc" });

    expect(fetchSpy).toHaveBeenCalledWith(`${API_BASE}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone: "+15551112222", code: "123456" })
    });
  });
});
