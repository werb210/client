import { describe, expect, it } from "vitest";
import { getResumeRoute } from "../resume";

describe("getResumeRoute", () => {
  it("clamps step navigation within the wizard range", () => {
    expect(getResumeRoute({ currentStep: 0 })).toBe("/apply/step-1");
    expect(getResumeRoute({ currentStep: 3 })).toBe("/apply/step-3");
    expect(getResumeRoute({ currentStep: 10 })).toBe("/apply/step-6");
  });
});
