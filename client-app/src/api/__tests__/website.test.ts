import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();
const continuationSessionMock = vi.fn();

vi.mock("@/api", () => ({
  default: {
    post: postMock,
  },
}));

vi.mock("@/api/continuation", () => ({
  getContinuationSession: continuationSessionMock,
}));

describe("website API dedupe", () => {
  beforeEach(() => {
    postMock.mockReset();
    continuationSessionMock.mockReset();
    continuationSessionMock.mockResolvedValue(null);
    localStorage.clear();
  });

  it("dedupes credit readiness submissions by email/phone", async () => {
    const { submitCreditReadiness } = await import("../website");
    postMock.mockResolvedValue({ data: { sessionId: "session-1", leadId: "lead-1" } });

    const payload = {
      companyName: "ACME",
      fullName: "Taylor",
      email: "taylor@example.com",
      phone: "+15555555555",
    };

    await submitCreditReadiness(payload);
    await submitCreditReadiness(payload);

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenCalledWith(
      "/website/credit-readiness",
      payload,
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Idempotency-Key": "readiness:taylor@example.com::+15555555555",
        }),
      })
    );
  });

  it("uses existing continuation session instead of creating duplicates", async () => {
    const { submitCreditReadiness, getStoredReadinessSessionId } = await import("../website");
    continuationSessionMock.mockResolvedValue({
      readinessSessionId: "ready-123",
      email: "taylor@example.com",
      phone: "+15555555555",
    });

    const payload = {
      companyName: "ACME",
      fullName: "Taylor",
      email: "taylor@example.com",
      phone: "+15555555555",
    };

    const response = await submitCreditReadiness(payload);

    expect(postMock).not.toHaveBeenCalled();
    expect(response).toEqual(
      expect.objectContaining({ readinessSessionId: "ready-123" })
    );
    expect(getStoredReadinessSessionId()).toBe("ready-123");
  });
});
