import { describe, expect, it } from "vitest";
import { resolveOtpNextStep } from "../otp";
import type { ClientProfile } from "../../state/clientProfiles";

describe("resolveOtpNextStep", () => {
  it("resumes when the phone has an in-progress application", () => {
    const profile: ClientProfile = {
      phone: "+1 (555) 111-2222",
      applicationTokens: ["token-active"],
      updatedAt: Date.now(),
    };
    expect(resolveOtpNextStep(profile)).toEqual({
      action: "resume",
      token: "token-active",
    });
  });

  it("routes submitted applicants to the portal", () => {
    const profile: ClientProfile = {
      phone: "+1 (555) 999-0000",
      applicationTokens: ["token-active"],
      submittedTokens: ["token-submitted"],
      lastSubmittedToken: "token-submitted",
      updatedAt: Date.now(),
    };
    expect(resolveOtpNextStep(profile)).toEqual({
      action: "portal",
      token: "token-submitted",
    });
  });
});
