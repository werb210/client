import { beforeEach, describe, expect, it, vi } from "vitest";
import { mapSubmissionStatus } from "../applicationStatus";
import { createProcessingStatusPoller } from "../../hooks/useProcessingStatusPoller";

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }
}

describe("submission status", () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage() as unknown as Storage;
  });

  it("treats Google Sheet submissions the same as API submissions", () => {
    const google = mapSubmissionStatus({
      status: "submitted",
      method: "google_sheet",
      updated_at: "2024-10-01T12:00:00Z",
    });
    const api = mapSubmissionStatus({
      status: "submitted",
      method: "api",
      updated_at: "2024-10-01T12:00:00Z",
    });
    expect(google).toEqual(api);
  });

  it("stops polling after submission resolves", async () => {
    vi.useFakeTimers();
    const updates: string[] = [];
    const fetchStatus = vi
      .fn()
      .mockResolvedValueOnce({
        status: "pending",
        updatedAt: null,
        rawStatus: "pending",
      })
      .mockResolvedValueOnce({
        status: "submitted",
        updatedAt: null,
        rawStatus: "submitted",
      });

    createProcessingStatusPoller({
      fetchStatus,
      onUpdate: (snapshot) => updates.push((snapshot as { status: string }).status),
      isTerminal: (snapshot) => (snapshot as { status: string }).status !== "pending",
      getVisibility: () => true,
      getOnline: () => true,
      subscribeVisibility: () => () => undefined,
      subscribeOnline: () => () => undefined,
      initialDelayMs: 15000,
      maxDelayMs: 15000,
    });

    await Promise.resolve();
    expect(fetchStatus).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(15000);
    expect(fetchStatus).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(15000);
    expect(fetchStatus).toHaveBeenCalledTimes(2);
    expect(updates).toEqual(["pending", "submitted"]);

    vi.useRealTimers();
  });
});
