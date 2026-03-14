import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortalEntry } from "../pages/PortalEntry";
import { ClientProfileStore } from "../state/clientProfiles";

const { startOtpMock, verifyOtpMock } = vi.hoisted(() => ({
  startOtpMock: vi.fn(),
  verifyOtpMock: vi.fn(),
}));

vi.mock("@/services/auth", () => ({
  startOtp: startOtpMock,
  verifyOtp: verifyOtpMock,
}));

describe("PortalEntry OTP runtime", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    startOtpMock.mockReset();
    startOtpMock.mockResolvedValue({ ok: true, sessionToken: "session-1" });
    ClientProfileStore.setLastUsedPhone("(555) 111-2222");

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("renders OTP entry inputs after request-otp succeeds", async () => {
    await act(async () => {
      root.render(createElement(PortalEntry));
    });

    const sendCodeButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Send code")
    ) as HTMLButtonElement;

    await act(async () => {
      sendCodeButton.click();
      await Promise.resolve();
    });

    expect(startOtpMock).toHaveBeenCalledTimes(1);

    const otpInputs = container.querySelectorAll('input[inputmode="numeric"]');
    expect(otpInputs).toHaveLength(6);
  });
});
