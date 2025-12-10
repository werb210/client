import { describe, expect, it } from "vitest";

// Basic sanity check to ensure the Vitest runner is wired correctly.
describe("build pipeline", () => {
  it("executes test suite without errors", () => {
    expect(true).toBe(true);
  });
});
