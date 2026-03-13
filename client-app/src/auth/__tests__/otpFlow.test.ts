import { beforeEach, describe, expect, it } from "vitest";
import { ClientProfileStore } from "../../state/clientProfiles";
import { resolveOtpNextStep } from "../otp";

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

describe("OTP flow", () => {
  beforeEach(() => {
    const local = new MemoryStorage();
    globalThis.localStorage = local as unknown as Storage;
  });

  it("routes a fresh applicant to start", () => {
    const phone = "(555) 222-3333";

    const nextStep = resolveOtpNextStep(ClientProfileStore.getProfile(phone));
    expect(nextStep).toEqual({ action: "start" });
  });

  it("routes a returning applicant to resume", () => {
    const phone = "(555) 999-0000";
    ClientProfileStore.upsertProfile(phone, "token-resume");

    const nextStep = resolveOtpNextStep(ClientProfileStore.getProfile(phone));
    expect(nextStep).toEqual({ action: "resume", token: "token-resume" });
  });
});
