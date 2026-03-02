import { afterEach, vi, expect } from "vitest";

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
