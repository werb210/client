import { beforeEach, describe, expect, it } from "vitest";
import { syncRequiredDocumentsFromStatus } from "../requiredDocumentsCache";

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

  clear() {
    this.store.clear();
  }
}

describe("syncRequiredDocumentsFromStatus", () => {
  beforeEach(() => {
    const storage = new MemoryStorage();
    globalThis.localStorage = storage as unknown as Storage;
  });

  it("merges required documents from status and ensures bank statements", () => {
    const status = {
      required_documents: ["tax_returns"],
    };
    const merged = syncRequiredDocumentsFromStatus(status);
    const docTypes = (merged || []).map((entry) => entry.document_type);
    expect(docTypes.sort()).toEqual(["bank_statements", "tax_returns"].sort());
  });
});
