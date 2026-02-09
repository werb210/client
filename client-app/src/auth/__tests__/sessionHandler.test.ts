import { beforeEach, describe, expect, it } from "vitest";
import { handleAuthError } from "../sessionHandler";
import {
  ensureClientSession,
  getClientSessionByToken,
  getClientSessionState,
  setActiveClientSessionToken,
} from "../../state/clientSession";

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

describe("handleAuthError", () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage() as Storage;
    globalThis.sessionStorage = new MemoryStorage() as Storage;
  });

  it("marks the active session as revoked on auth failures", async () => {
    const accessToken = "token-123";
    ensureClientSession({ submissionId: "sub-1", accessToken });
    setActiveClientSessionToken(accessToken);

    const error = {
      response: { status: 401 },
      config: {},
    };

    await expect(handleAuthError(error)).rejects.toBe(error);

    const session = getClientSessionByToken(accessToken);
    expect(session).not.toBeNull();
    expect(getClientSessionState(session!)).toBe("revoked");
  });
});

