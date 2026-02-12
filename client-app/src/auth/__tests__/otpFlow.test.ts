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

  it("verifies OTP for a fresh applicant", () => {
    const phone = "(555) 222-3333";
    const code = ClientProfileStore.requestOtp(phone);
    expect(ClientProfileStore.verifyOtp(phone, code)).toBe(true);

    const nextStep = resolveOtpNextStep(ClientProfileStore.getProfile(phone));
    expect(nextStep).toEqual({ action: "start" });
  });

  it("verifies OTP for a returning applicant", () => {
    const phone = "(555) 999-0000";
    ClientProfileStore.upsertProfile(phone, "token-resume");
    const code = ClientProfileStore.requestOtp(phone);
    expect(ClientProfileStore.verifyOtp(phone, code)).toBe(true);

    const nextStep = resolveOtpNextStep(ClientProfileStore.getProfile(phone));
    expect(nextStep).toEqual({ action: "resume", token: "token-resume" });
  });
});
