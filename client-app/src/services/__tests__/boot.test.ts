import { describe, expect, it } from "vitest";
import { resolveBootRoute } from "../boot";

describe("resolveBootRoute", () => {
  it("routes submitted applicants to the portal", () => {
    expect(
      resolveBootRoute({
        hasSubmittedProfile: true,
        hasCachedApplication: true,
      })
    ).toBe("/portal");
  });

  it("routes cached applications to resume", () => {
    expect(
      resolveBootRoute({
        hasSubmittedProfile: false,
        hasCachedApplication: true,
      })
    ).toBe("/resume");
  });

  it("routes new visitors to the first application step", () => {
    expect(
      resolveBootRoute({
        hasSubmittedProfile: false,
        hasCachedApplication: false,
      })
    ).toBe("/apply/step-1");
  });
});
