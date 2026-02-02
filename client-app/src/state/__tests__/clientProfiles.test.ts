import { beforeEach, describe, expect, it } from "vitest";
import { ClientProfileStore } from "../clientProfiles";

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

describe("ClientProfileStore portal sessions", () => {
  beforeEach(() => {
    const local = new MemoryStorage();
    const session = new MemoryStorage();
    globalThis.localStorage = local as Storage;
    globalThis.sessionStorage = session as Storage;
  });

  it("requires portal verification per visit", () => {
    ClientProfileStore.markPortalVerified("token-123");
    expect(ClientProfileStore.hasPortalSession("token-123")).toBe(true);

    const newSession = new MemoryStorage();
    globalThis.sessionStorage = newSession as Storage;
    expect(ClientProfileStore.hasPortalSession("token-123")).toBe(false);
  });
});
