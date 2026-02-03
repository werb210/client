import { beforeEach, describe, expect, it } from "vitest";
import {
  loadSubmissionStatusCache,
  saveSubmissionStatusCache,
} from "../applicationStatus";

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

describe("resume flow", () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage() as Storage;
  });

  it("restores the last known submission state after reload", () => {
    const snapshot = {
      status: "submitted" as const,
      updatedAt: "2024-10-11T18:25:43.511Z",
      rawStatus: "submitted",
    };
    saveSubmissionStatusCache("token-123", snapshot);
    expect(loadSubmissionStatusCache("token-123")).toEqual(snapshot);
  });
});
