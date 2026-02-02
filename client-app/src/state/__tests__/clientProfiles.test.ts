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

describe("ClientProfileStore", () => {
  beforeEach(() => {
    const local = new MemoryStorage();
    const session = new MemoryStorage();
    globalThis.localStorage = local as Storage;
    globalThis.sessionStorage = session as Storage;
    globalThis.window = {
      sessionStorage: session,
      localStorage: local,
    } as Window & typeof globalThis;
  });

  it("normalizes the same phone number to one profile", () => {
    ClientProfileStore.upsertProfile("(555) 111-2222", "token-one");
    ClientProfileStore.upsertProfile("555-111-2222", "token-two");

    const profile = ClientProfileStore.getProfile("5551112222");
    expect(profile?.applicationTokens).toEqual(["token-two", "token-one"]);
  });

  it("stores portal sessions in local storage", () => {
    ClientProfileStore.markPortalVerified("token-portal");
    expect(ClientProfileStore.hasPortalSession("token-portal")).toBe(true);
  });
});
