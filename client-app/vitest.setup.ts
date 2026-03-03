import { afterEach, vi } from "vitest";

afterEach(() => {
  vi.clearAllMocks();
});

// Properly typed fetch mock
global.fetch = vi.fn() as unknown as typeof fetch;

// Extend expect safely
declare module "vitest" {
  interface Assertion<T = unknown> {
    toBeInTheDocument(): T;
  }
}

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
