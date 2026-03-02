import { afterAll, beforeAll, beforeEach, vi } from "vitest";

const BLOCKED_NETWORK_ERROR = "Real network requests are blocked during tests.";

const originalFetch = globalThis.fetch;
const originalXMLHttpRequest = globalThis.XMLHttpRequest;
const originalWebSocket = globalThis.WebSocket;
const originalCrypto = globalThis.crypto;

function blockFetch(input: RequestInfo | URL, init?: RequestInit): never {
  const method = init?.method ?? "GET";
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url;

  throw new Error(`${BLOCKED_NETWORK_ERROR} [fetch] ${method} ${url}`);
}

class BlockedXMLHttpRequest {
  open(method: string, url: string | URL) {
    throw new Error(`${BLOCKED_NETWORK_ERROR} [XMLHttpRequest] ${method} ${String(url)}`);
  }
  send() {
    throw new Error(`${BLOCKED_NETWORK_ERROR} [XMLHttpRequest] send`);
  }
}

class BlockedWebSocket {
  constructor(url: string | URL) {
    throw new Error(`${BLOCKED_NETWORK_ERROR} [WebSocket] ${String(url)}`);
  }
}

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

  vi.stubEnv("VITE_API_BASE_URL", "http://localhost");
  vi.stubEnv("VITE_API_URL", "http://localhost");
  vi.stubEnv("VITE_SERVER_URL", "http://localhost");
  vi.stubEnv("VITE_REQUIRE_OTP", "false");

  if (!vi.isMockFunction(globalThis.fetch)) {
    vi.stubGlobal("fetch", vi.fn(blockFetch));
  }

  vi.stubGlobal("XMLHttpRequest", BlockedXMLHttpRequest as any);
  vi.stubGlobal("WebSocket", BlockedWebSocket as any);

  vi.stubGlobal("crypto", {
    ...originalCrypto,
    randomUUID: vi.fn(() => "00000000-0000-4000-8000-000000000000"),
  });
});

beforeEach(() => {
  const storage = globalThis.localStorage;
  const session = globalThis.sessionStorage;

  if (storage && typeof storage.clear === "function") {
    storage.clear();
  }

  if (session && typeof session.clear === "function") {
    session.clear();
  }
});

afterAll(() => {
  vi.useRealTimers();
  vi.stubGlobal("fetch", originalFetch);
  vi.stubGlobal("XMLHttpRequest", originalXMLHttpRequest);
  vi.stubGlobal("WebSocket", originalWebSocket);
  vi.stubGlobal("crypto", originalCrypto);
});
