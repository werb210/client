import { afterEach, describe, expect, it, vi } from "vitest";
import { startOtp, verifyOtp } from "../services/otpService";

describe("otpService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls request OTP endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as Response);

    await expect(startOtp("(555) 111-2222")).resolves.toEqual({ success: true });

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/request-otp", {
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

    await expect(verifyOtp("(555) 111-2222", "123456")).resolves.toEqual({ token: "abc" });

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "+15551112222", code: "123456" })
    });
  });
});
