import { describe, expect, it, vi } from "vitest";
import { handleAuthError } from "../sessionHandler";
import { refreshSessionOnce } from "../sessionRefresh";

vi.mock("../sessionRefresh", () => ({
  refreshSessionOnce: vi.fn(),
}));

describe("handleAuthError", () => {
  it("refreshes the session and retries once on token expiry", async () => {
    const retry = vi.fn().mockResolvedValue({ data: "ok" });
    vi.mocked(refreshSessionOnce).mockResolvedValue(true);

    const error = {
      response: { status: 401 },
      config: {},
    };

    const result = await handleAuthError(error, retry);

    expect(refreshSessionOnce).toHaveBeenCalledTimes(1);
    expect(retry).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: "ok" });
  });
});
