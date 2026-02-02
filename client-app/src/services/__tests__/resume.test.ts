import { describe, expect, it, vi } from "vitest";
import { resumeApplication } from "../resume";

describe("resumeApplication", () => {
  it("returns cached data when offline", async () => {
    const cached = { applicationToken: "token-123" };
    const fetchStatus = vi.fn().mockResolvedValue({ data: {} });

    const snapshot = await resumeApplication({
      fetchStatus,
      cached,
      isOnline: false,
    });

    expect(snapshot?.token).toBe("token-123");
    expect(snapshot?.offline).toBe(true);
    expect(fetchStatus).not.toHaveBeenCalled();
  });
});
