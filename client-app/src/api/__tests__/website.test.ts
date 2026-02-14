import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();

vi.mock("@/api", () => ({
  default: {
    post: postMock,
  },
}));

describe("website API dedupe", () => {
  beforeEach(() => {
    postMock.mockReset();
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
  });
});
