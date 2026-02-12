import { describe, expect, it } from "vitest";
import { resolveStepGuard } from "../stepGuard";

describe("resolveStepGuard", () => {
  it("blocks moving to incomplete future steps", () => {
    const guard = resolveStepGuard(1, 2);
    expect(guard.allowed).toBe(false);
    expect(guard.redirectStep).toBe(1);
  });

  it("blocks skipping multiple steps ahead", () => {
    const guard = resolveStepGuard(1, 4);
    expect(guard.allowed).toBe(false);
    expect(guard.redirectStep).toBe(1);
  });

  it("permits returning to completed steps", () => {
    const guard = resolveStepGuard(4, 2);
    expect(guard.allowed).toBe(true);
    expect(guard.redirectStep).toBe(2);
  });
});
