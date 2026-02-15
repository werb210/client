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
      "/api/readiness/submit",
      payload,
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Idempotency-Key": "readiness:taylor@example.com::+15555555555",
        }),
      })
    );
  });


  it("reuses an in-flight readiness request to prevent duplicate submissions", async () => {
    const { submitCreditReadiness } = await import("../website");

    let resolvePost: ((value: unknown) => void) | null = null;
    postMock.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      })
    );

    const payload = {
      companyName: "ACME",
      fullName: "Taylor",
      email: "taylor@example.com",
      phone: "+15555555555",
    };

    const first = submitCreditReadiness(payload);
    const second = submitCreditReadiness(payload);

    expect(postMock).toHaveBeenCalledTimes(1);
    resolvePost?.({ data: { sessionId: "session-1", leadId: "lead-1" } });

    await expect(first).resolves.toEqual({ sessionId: "session-1", leadId: "lead-1" });
    await expect(second).resolves.toEqual({ sessionId: "session-1", leadId: "lead-1" });
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

  it("retries readiness submission once on server errors", async () => {
    const { submitCreditReadiness } = await import("../website");
    postMock
      .mockRejectedValueOnce({ response: { status: 503 } })
      .mockResolvedValueOnce({ data: { sessionId: "session-2", leadId: "lead-2" } });

    const payload = {
      companyName: "ACME",
      fullName: "Taylor",
      email: "retry@example.com",
      phone: "+15555555556",
    };

    const response = await submitCreditReadiness(payload);

    expect(postMock).toHaveBeenCalledTimes(2);
    expect(response).toEqual({ sessionId: "session-2", leadId: "lead-2" });
  });
  it("clears readiness session and token after completion", async () => {
    const { clearStoredReadinessSession } = await import("../website");

    localStorage.setItem("boreal_readiness_session_id", "session-xyz");
    localStorage.setItem("boreal_readiness_token", "token-xyz");

    clearStoredReadinessSession();

    expect(localStorage.getItem("boreal_readiness_session_id")).toBeNull();
    expect(localStorage.getItem("boreal_readiness_token")).toBeNull();
  });

  it("resolves session id from query string and persists it", async () => {
    const { resolveReadinessSessionId } = await import("../website");

    const sessionId = resolveReadinessSessionId("?sessionId=session-xyz");

    expect(sessionId).toBe("session-xyz");
    expect(localStorage.getItem("boreal_readiness_session_id")).toBe("session-xyz");
  });

  it("supports token query param for readiness continuation token", async () => {
    const { getReadinessTokenFromUrl } = await import("../website");

    const token = getReadinessTokenFromUrl("?token=token-xyz");

    expect(token).toBe("token-xyz");
  });


  it("stores returned session token from contact submissions", async () => {
    const { submitContactForm, getStoredReadinessSessionId } = await import("../website");
    postMock.mockResolvedValue({
      data: { readinessSessionId: "contact-ready-1", readinessToken: "contact-token-1" },
    });

    const payload = {
      companyName: "ACME",
      fullName: "Taylor",
      email: "taylor@example.com",
      phone: "+15555555555",
      message: "Need help",
    };

    await submitContactForm(payload);

    expect(getStoredReadinessSessionId()).toBe("contact-ready-1");
    expect(localStorage.getItem("boreal_readiness_token")).toBe("contact-token-1");
  });

  it("dedupes contact submissions by email/phone", async () => {
    const { submitContactForm } = await import("../website");
    postMock.mockResolvedValue({ data: { leadId: "lead-1" } });

    const payload = {
      companyName: "ACME",
      fullName: "Taylor",
      email: "taylor@example.com",
      phone: "+15555555555",
      message: "Need help",
    };

    await submitContactForm(payload);
    await submitContactForm(payload);

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenCalledWith(
      "/api/contact/submit",
      payload,
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Idempotency-Key": "contact:taylor@example.com::+15555555555",
        }),
      })
    );
  });

});
