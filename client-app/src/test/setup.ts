import { vi } from "vitest";
import "../../vitest.setup";

/**
 * JSDOM stability/polyfills for client app tests.
 */

function makeStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

Object.defineProperty(window, "localStorage", { value: makeStorage(), configurable: true });
Object.defineProperty(window, "sessionStorage", { value: makeStorage(), configurable: true });

if (!window.matchMedia) {
  // @ts-expect-error polyfill
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

if (!(globalThis as any).ResizeObserver) {
  (globalThis as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!window.scrollTo) {
  window.scrollTo = vi.fn();
}

if (!(globalThis as any).TextEncoder) {
  const { TextEncoder } = require("util");
  (globalThis as any).TextEncoder = TextEncoder;
}

if (!(globalThis as any).TextDecoder) {
  const { TextDecoder } = require("util");
  (globalThis as any).TextDecoder = TextDecoder;
}
