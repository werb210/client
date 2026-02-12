import { describe, expect, it } from "vitest";
import { loadUploadState, saveUploadState } from "../uploadState";

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

describe("upload state persistence", () => {
  it("restores interrupted uploads with retry messaging", () => {
    const storage = new MemoryStorage() as unknown as Storage;
    saveUploadState(
      "app-123",
      { bank_statements: { uploading: true, progress: 42 } },
      {},
      storage
    );

    const restored = loadUploadState("app-123", storage);
    expect(restored.state.bank_statements.uploading).toBe(false);
    expect(restored.state.bank_statements.progress).toBe(42);
    expect(restored.errors.bank_statements).toBe(
      "Upload interrupted. Please retry this document."
    );
  });

  it("persists upload errors alongside state", () => {
    const storage = new MemoryStorage() as unknown as Storage;
    saveUploadState(
      "app-456",
      { tax_returns: { uploading: false, progress: 100 } },
      { tax_returns: "Upload failed. Please try again." },
      storage
    );

    const restored = loadUploadState("app-456", storage);
    expect(restored.state.tax_returns.progress).toBe(100);
    expect(restored.errors.tax_returns).toBe("Upload failed. Please try again.");
  });
});
