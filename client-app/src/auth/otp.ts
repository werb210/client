import type { ClientProfile } from "../state/clientProfiles";

export type OtpNextStep =
  | { action: "start" }
  | { action: "resume"; token: string }
  | { action: "portal"; token: string };

export function resolveOtpNextStep(profile: ClientProfile | null): OtpNextStep {
  if (!profile) {
    return { action: "start" };
  }

  const submittedToken =
    profile.lastSubmittedToken ?? profile.submittedTokens?.[0] ?? "";
  if (submittedToken) {
    return { action: "portal", token: submittedToken };
  }

  const activeToken = profile.lastActiveToken || profile.applicationTokens?.[0];
  if (activeToken) {
    return { action: "resume", token: activeToken };
  }

  return { action: "start" };
}
