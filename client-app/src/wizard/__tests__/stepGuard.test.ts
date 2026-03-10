import { describe, expect, it } from "vitest";
import { resolveStepGuard } from "../stepGuard";

describe("resolveStepGuard", () => {
  it("allows moving to the immediate next step", () => {
    expect(resolveStepGuard(1, 2)).toBe(2);
  });

  it("prevents skipping ahead by more than one step", () => {
    expect(resolveStepGuard(1, 4)).toBe(2);
    expect(resolveStepGuard(1, 3)).toBe(2);
  });

  it("allows moving backward", () => {
    expect(resolveStepGuard(4, 2)).toBe(2);
  });

  it("supports all six wizard steps", () => {
    expect(resolveStepGuard(6, 6)).toBe(6);
    expect(resolveStepGuard(6, 8)).toBe(6);
  });
});
