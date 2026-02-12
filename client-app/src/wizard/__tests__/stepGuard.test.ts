import { describe, expect, it } from "vitest";
import { resolveStepGuard } from "../stepGuard";

describe("resolveStepGuard", () => {
  it("permits moving forward a single step", () => {
    const guard = resolveStepGuard(1, 2);
    expect(guard.allowed).toBe(true);
    expect(guard.redirectStep).toBe(2);
  });

  it("blocks skipping multiple steps ahead", () => {
    const guard = resolveStepGuard(1, 4);
    expect(guard.allowed).toBe(false);
    expect(guard.redirectStep).toBe(1);
  });

  it("blocks deep-linking to step 3 from step 1", () => {
    const guard = resolveStepGuard(1, 3);
    expect(guard.allowed).toBe(false);
    expect(guard.redirectStep).toBe(1);
  });

  it("permits returning to completed steps", () => {
    const guard = resolveStepGuard(4, 2);
    expect(guard.allowed).toBe(true);
    expect(guard.redirectStep).toBe(2);
  });
});
