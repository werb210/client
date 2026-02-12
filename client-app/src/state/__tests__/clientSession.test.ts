import { beforeEach, describe, expect, it } from "vitest";
import {
  ensureClientSession,
  getClientSessionByToken,
  getClientSessionState,
  markClientSessionExpired,
  markClientSessionRevoked,
} from "../clientSession";

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

describe("client sessions", () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage() as unknown as Storage;
    globalThis.sessionStorage = new MemoryStorage() as unknown as Storage;
  });

  it("treats a future-expiring session as valid", () => {
    const session = ensureClientSession({
      submissionId: "sub-123",
      accessToken: "token-123",
      expiresAt: Date.now() + 60_000,
    });
    expect(getClientSessionState(session)).toBe("valid");
  });

  it("marks a session as expired when past the expiry window", () => {
    const session = ensureClientSession({
      submissionId: "sub-456",
      accessToken: "token-456",
      expiresAt: Date.now() - 1000,
    });
    markClientSessionExpired(session.accessToken, Date.now() - 500);
    const updated = getClientSessionByToken(session.accessToken);
    expect(getClientSessionState(updated!)).toBe("expired");
  });

  it("marks a session as revoked when revokedAt is present", () => {
    const session = ensureClientSession({
      submissionId: "sub-789",
      accessToken: "token-789",
      expiresAt: Date.now() + 60_000,
    });
    markClientSessionRevoked(session.accessToken, Date.now());
    const updated = getClientSessionByToken(session.accessToken);
    expect(getClientSessionState(updated!)).toBe("revoked");
  });
});
