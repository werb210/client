import { afterEach, describe, expect, it, vi } from "vitest";
import { requestOtp, startOtp, verifyOtp } from "../services/otpService";

const API = "https://server.boreal.financial/api/auth";

describe("otpService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls request OTP endpoint with normalized phone", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    await expect(requestOtp("(555) 111-2222")).resolves.toEqual({ success: true });

    expect(fetchSpy).toHaveBeenCalledWith(`${API}/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "+15551112222" }),
    });
  });

  it("keeps startOtp compatibility", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    await expect(startOtp("+15551112222")).resolves.toEqual({ success: true });
  });

  it("calls verify OTP endpoint with normalized phone and code", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ token: "abc" }),
    } as Response);

    await expect(verifyOtp("5551112222", "123456")).resolves.toEqual({ token: "abc" });

    expect(fetchSpy).toHaveBeenCalledWith(`${API}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "+15551112222", code: "123456" }),
    });
  });
});
