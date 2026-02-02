import { describe, expect, it, vi, beforeEach } from "vitest";
import { refreshSessionOnce, resetRefreshFailure } from "../sessionRefresh";
import { clearServiceWorkerCaches } from "../../pwa/serviceWorker";
import { ClientProfileStore } from "../../state/clientProfiles";

vi.mock("../../pwa/serviceWorker", () => ({
  clearServiceWorkerCaches: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../state/clientProfiles", () => ({
  ClientProfileStore: {
    clearPortalSessions: vi.fn(),
  },
}));

describe("refreshSessionOnce", () => {
  beforeEach(() => {
    resetRefreshFailure();
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { assign: vi.fn() },
      },
      configurable: true,
    });
  });

  it("redirects to OTP when refresh fails", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    const assignSpy = vi
      .spyOn(window.location, "assign")
      .mockImplementation(() => {});

    const result = await refreshSessionOnce();

    expect(result).toBe(false);
    expect(ClientProfileStore.clearPortalSessions).toHaveBeenCalled();
    expect(clearServiceWorkerCaches).toHaveBeenCalledWith("otp");
    expect(assignSpy).toHaveBeenCalledWith("/portal");

    assignSpy.mockRestore();
  });
});
