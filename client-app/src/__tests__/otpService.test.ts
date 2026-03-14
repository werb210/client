import { afterEach, describe, expect, it, vi } from "vitest";
import { requestOtp, startOtp, verifyOtp } from "../services/auth";

describe("auth OTP service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls request OTP endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, sessionToken: "session-1" }),
    } as unknown as Response);

    await expect(requestOtp("(555) 111-2222")).resolves.toMatchObject({ ok: true });

    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("/api/auth/otp/start"), expect.any(Object));
  });

  it("keeps startOtp compatibility", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true }),
    } as unknown as Response);

    await expect(startOtp("+15551112222")).resolves.toMatchObject({ ok: true });
  });

  it("calls verify OTP endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, token: "abc" }),
    } as unknown as Response);

    await expect(verifyOtp("5551112222", "123456")).resolves.toMatchObject({ ok: true, sessionToken: "abc" });

    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("/api/auth/otp/verify"), expect.any(Object));
  });
});
