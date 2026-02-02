import { describe, expect, it, vi } from "vitest";
import { resumeApplication } from "../resume";

describe("resumeApplication", () => {
  it("returns cached data when offline", async () => {
    const snapshot = await resumeApplication({
      fetchStatus: vi.fn(),
      cached: { applicationToken: "token-123", data: "cached" },
      isOnline: false,
    });

    expect(snapshot).toEqual({
      token: "token-123",
      status: null,
      cached: { applicationToken: "token-123", data: "cached" },
      offline: true,
    });
  });

  it("falls back to cached data when the status fetch fails", async () => {
    const fetchStatus = vi.fn().mockRejectedValue(new Error("fail"));
    const snapshot = await resumeApplication({
      fetchStatus,
      cached: { applicationToken: "token-456", data: "cached" },
      isOnline: true,
    });

    expect(snapshot?.offline).toBe(true);
    expect(fetchStatus).toHaveBeenCalledWith("token-456");
  });

  it("returns status when online", async () => {
    const fetchStatus = vi.fn().mockResolvedValue({ data: { status: "ok" } });
    const snapshot = await resumeApplication({
      fetchStatus,
      cached: { applicationToken: "token-789", data: "cached" },
      isOnline: true,
    });

    expect(snapshot).toEqual({
      token: "token-789",
      status: { status: "ok" },
      cached: { applicationToken: "token-789", data: "cached" },
      offline: false,
    });
  });
});
