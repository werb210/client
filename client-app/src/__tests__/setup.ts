import { vi } from "vitest";

/**
 * Test environment stabilization for JSDOM
 */

/* ------------------------------
   Fix localStorage readonly error
------------------------------- */

const storageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

vi.spyOn(Storage.prototype, "getItem").mockImplementation(storageMock.getItem);
vi.spyOn(Storage.prototype, "setItem").mockImplementation(storageMock.setItem);
vi.spyOn(Storage.prototype, "removeItem").mockImplementation(storageMock.removeItem);
vi.spyOn(Storage.prototype, "clear").mockImplementation(storageMock.clear);

/* ------------------------------
   matchMedia polyfill
------------------------------- */

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

/* ------------------------------
   ResizeObserver polyfill
------------------------------- */

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as any).ResizeObserver = ResizeObserverMock;

/* ------------------------------
   scrollTo polyfill
------------------------------- */

window.scrollTo = vi.fn();

/* ------------------------------
   TextEncoder / TextDecoder
------------------------------- */

import { TextEncoder, TextDecoder } from "util";

(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;


/* ------------------------------
   React act + scrollIntoView polyfills
------------------------------- */

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}
