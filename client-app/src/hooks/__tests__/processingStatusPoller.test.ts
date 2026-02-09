import { describe, expect, it, vi } from "vitest";
import { createProcessingStatusPoller } from "../useProcessingStatusPoller";

describe("createProcessingStatusPoller", () => {
  it("backs off exponentially while polling", async () => {
    vi.useFakeTimers();
    const fetchStatus = vi.fn().mockResolvedValue({ status: "pending" });
    const stop = createProcessingStatusPoller({
      fetchStatus,
      onUpdate: () => undefined,
      isTerminal: () => false,
      getVisibility: () => true,
      getOnline: () => true,
      subscribeVisibility: () => () => undefined,
      subscribeOnline: () => () => undefined,
      initialDelayMs: 1000,
      maxDelayMs: 8000,
    });

    await vi.runAllTicks();
    expect(fetchStatus).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchStatus).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchStatus).toHaveBeenCalledTimes(3);

    await vi.advanceTimersByTimeAsync(4000);
    expect(fetchStatus).toHaveBeenCalledTimes(4);

    stop();
    vi.useRealTimers();
  });

  it("pauses on hidden tab and resumes when visible", async () => {
    vi.useFakeTimers();
    let visible = false;
    const fetchStatus = vi.fn().mockResolvedValue({ status: "pending" });
    const subscribers: Array<() => void> = [];
    const subscribeVisibility = (handler: () => void) => {
      subscribers.push(handler);
      return () => {
        const index = subscribers.indexOf(handler);
        if (index >= 0) subscribers.splice(index, 1);
      };
    };

    const stop = createProcessingStatusPoller({
      fetchStatus,
      onUpdate: () => undefined,
      isTerminal: () => false,
      getVisibility: () => visible,
      getOnline: () => true,
      subscribeVisibility,
      subscribeOnline: () => () => undefined,
      initialDelayMs: 1000,
      maxDelayMs: 2000,
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchStatus).toHaveBeenCalledTimes(0);

    visible = true;
    subscribers.forEach((handler) => handler());

    await vi.runAllTicks();
    expect(fetchStatus).toHaveBeenCalledTimes(1);

    stop();
    vi.useRealTimers();
  });

  it("stops when terminal status is reached", async () => {
    vi.useFakeTimers();
    const fetchStatus = vi.fn().mockResolvedValue({ status: "completed" });

    const stop = createProcessingStatusPoller({
      fetchStatus,
      onUpdate: () => undefined,
      isTerminal: () => true,
      getVisibility: () => true,
      getOnline: () => true,
      subscribeVisibility: () => () => undefined,
      subscribeOnline: () => () => undefined,
      initialDelayMs: 1000,
      maxDelayMs: 2000,
    });

    await vi.runAllTicks();
    expect(fetchStatus).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2000);
    expect(fetchStatus).toHaveBeenCalledTimes(1);

    stop();
    vi.useRealTimers();
  });
});

