import { describe, expect, it, vi } from "vitest";
import { createPipelinePoller, getPipelineStage } from "../pipeline";

describe("pipeline polling", () => {
  it("maps status text to a pipeline stage", () => {
    expect(getPipelineStage({ status: "In Review" })).toBe("In Review");
    expect(getPipelineStage({ status: "Offer ready" })).toBe("Offer");
    expect(getPipelineStage({ status: "Documents required" })).toBe(
      "Documents Required"
    );
  });

  it("polls and emits updates as status changes", async () => {
    vi.useFakeTimers();
    const updates: string[] = [];
    const fetchStatus = vi
      .fn()
      .mockResolvedValueOnce({ status: "Received" })
      .mockResolvedValueOnce({ status: "In Review" });

    const stop = createPipelinePoller({
      token: "token-1",
      fetchStatus,
      intervalMs: 5000,
      onUpdate: (status) => updates.push(status.status),
    });

    await vi.runAllTicks();
    expect(updates).toEqual(["Received"]);

    await vi.advanceTimersByTimeAsync(5000);
    expect(updates).toEqual(["Received", "In Review"]);

    stop();
    vi.useRealTimers();
  });
});
