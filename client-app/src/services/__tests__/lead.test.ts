import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();

vi.mock("@/lib/api", () => ({
  default: {
    post: postMock,
  },
}));

describe("createLead dedupe", () => {
  beforeEach(() => {
    postMock.mockReset();
    localStorage.clear();
  });

  it("reuses existing lead by email/phone", async () => {
    const { createLead } = await import("../lead");

    postMock.mockResolvedValueOnce({ data: { leadId: "lead-1", pendingApplicationId: "app-1" } });

    const payload = {
      companyName: "ACME",
      fullName: "Taylor",
      email: "taylor@example.com",
      phone: "+15555555555",
    };

    const first = await createLead(payload);
    const second = await createLead(payload);

    expect(first.leadId).toBe("lead-1");
    expect(second.leadId).toBe("lead-1");
    expect(postMock).toHaveBeenCalledTimes(1);
  });
});
