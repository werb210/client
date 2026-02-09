import { describe, expect, it, vi } from "vitest";
import {
  createProcessingStatusPoller,
  isProcessingComplete,
} from "../useProcessingStatus";
import type { ProcessingStatus } from "@/types/processing";

function createStatus(overrides: Partial<ProcessingStatus> = {}): ProcessingStatus {
  return {
    ocr: { status: "pending", completedAt: null },
    banking: {
      status: "pending",
      completedAt: null,
      statementCount: 0,
      requiredStatements: 6,
    },
    ...overrides,
  };
}

describe("createProcessingStatusPoller", () => {
  it("polls while incomplete and stops after completion", async () => {
    vi.useFakeTimers();
    const updates: ProcessingStatus[] = [];
    const fetchStatus = vi
      .fn<[string], Promise<ProcessingStatus>>()
      .mockResolvedValueOnce(createStatus())
      .mockResolvedValueOnce(
        createStatus({
          ocr: { status: "completed", completedAt: "2024-01-01T00:00:00Z" },
          banking: {
            status: "completed",
            completedAt: "2024-01-02T00:00:00Z",
            statementCount: 6,
            requiredStatements: 6,
          },
        })
      );

    const getVisibility = vi.fn(() => true);
    const subscribers: Array<() => void> = [];
    const subscribeVisibility = (handler: () => void) => {
      subscribers.push(handler);
      return () => {
        const index = subscribers.indexOf(handler);
        if (index >= 0) subscribers.splice(index, 1);
      };
    };

    const stop = createProcessingStatusPoller({
      applicationId: "app_123",
      fetchStatus,
      onUpdate: (status) => updates.push(status),
      getVisibility,
      subscribeVisibility,
      intervalMs: 10_000,
    });

    await vi.runAllTicks();
    expect(fetchStatus).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchStatus).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(20_000);
    expect(fetchStatus).toHaveBeenCalledTimes(2);

    expect(updates.some(isProcessingComplete)).toBe(true);

    stop();
    vi.useRealTimers();
  });

  it("does not poll when visibility is false", async () => {
    vi.useFakeTimers();
    let visible = false;
    const fetchStatus = vi.fn<[string], Promise<ProcessingStatus>>();
    const subscribers: Array<() => void> = [];
    const subscribeVisibility = (handler: () => void) => {
      subscribers.push(handler);
      return () => {
        const index = subscribers.indexOf(handler);
        if (index >= 0) subscribers.splice(index, 1);
      };
    };

    const stop = createProcessingStatusPoller({
      applicationId: "app_456",
      fetchStatus,
      onUpdate: () => undefined,
      getVisibility: () => visible,
      subscribeVisibility,
      intervalMs: 10_000,
    });

    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchStatus).toHaveBeenCalledTimes(0);

    visible = true;
    subscribers.forEach((handler) => handler());

    await vi.runAllTicks();
    expect(fetchStatus).toHaveBeenCalledTimes(1);

    stop();
    vi.useRealTimers();
  });
});
