import { afterEach, describe, expect, it, vi } from "vitest";
import { requestOtp, startOtp, verifyOtp } from "../services/auth";
import * as clientApi from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";

describe("auth OTP service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls request OTP endpoint", async () => {
    const apiSpy = vi.spyOn(clientApi, "apiRequest").mockResolvedValue({ success: true, sessionToken: "session-1" });

    await expect(requestOtp("(555) 111-2222")).resolves.toMatchObject({ ok: true });

    expect(apiSpy).toHaveBeenCalledWith(API_ENDPOINTS.OTP_START, expect.any(Object));
  });

  it("keeps startOtp compatibility", async () => {
    vi.spyOn(clientApi, "apiRequest").mockResolvedValue({ success: true });

    await expect(startOtp("+15551112222")).resolves.toMatchObject({ ok: true });
  });

  it("calls verify OTP endpoint", async () => {
    const apiSpy = vi.spyOn(clientApi, "apiRequest").mockResolvedValue({ success: true, token: "abc" });

    await expect(verifyOtp("5551112222", "123456")).resolves.toMatchObject({ ok: true, sessionToken: "abc" });

    expect(apiSpy).toHaveBeenCalledWith(API_ENDPOINTS.OTP_VERIFY, expect.any(Object));
  });
});
