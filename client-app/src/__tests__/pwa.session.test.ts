import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearClientStorage } from "../auth/logout";
import { resolveSessionGuardAction } from "../auth/sessionGuard";

function createStorage(initial: Record<string, string> = {}) {
  let store = { ...initial };
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

describe("session guard", () => {
  it("reloads once when auth is missing", () => {
    const storage = createStorage();
    const first = resolveSessionGuardAction({
      isOffline: false,
      hasAuth: false,
      storage,
    });
    const second = resolveSessionGuardAction({
      isOffline: false,
      hasAuth: false,
      storage,
    });
    expect(first).toBe("reload");
    expect(second).toBe("redirect");
  });

  it("clears reload marker when auth is restored", () => {
    const storage = createStorage({ boreal_session_guard_reloaded: "true" });
    const action = resolveSessionGuardAction({
      isOffline: false,
      hasAuth: true,
      storage,
    });
    expect(action).toBe("noop");
    expect(storage.getItem("boreal_session_guard_reloaded")).toBeNull();
  });
});

describe("logout cleanup", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal("localStorage", createStorage());
    vi.stubGlobal("sessionStorage", createStorage());
  });

  it("clears local and session storage", () => {
    localStorage.setItem("foo", "bar");
    sessionStorage.setItem("baz", "qux");

    clearClientStorage();

    expect(localStorage.getItem("foo")).toBeNull();
    expect(sessionStorage.getItem("baz")).toBeNull();
  });
});
