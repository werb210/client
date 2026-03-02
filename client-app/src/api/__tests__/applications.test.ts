import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn().mockResolvedValue({ data: { ok: true } });

vi.mock("@/lib/api", () => ({
  default: {
    post: postMock,
  },
}));

describe("submitApplication", () => {
  const expectedAttribution: Record<string, string | null> = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    gclid: null,
    msclkid: null,
    ga_client_id: null,
  };

  beforeEach(() => {
    postMock.mockClear();
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);
    localStorage.clear();
  });

  it("sends idempotency key when provided", async () => {
    const { submitApplication } = await import("../applications");
    await submitApplication({ hello: "world" }, { idempotencyKey: "idem-123" });
    expect(postMock).toHaveBeenCalledWith(
      "/api/client/submissions",
      { hello: "world", ...expectedAttribution, creditSessionToken: null },
      { headers: { "Idempotency-Key": "idem-123" } }
    );
  });

  it("includes continuation token when provided", async () => {
    const { submitApplication } = await import("../applications");
    await submitApplication(
      { hello: "world" },
      { idempotencyKey: "idem-123", continuationToken: "cont-456" }
    );
    expect(postMock).toHaveBeenCalledWith(
      "/api/client/submissions",
      {
        hello: "world",
        ...expectedAttribution,
        continuationToken: "cont-456",
        creditSessionToken: null,
      },
      { headers: { "Idempotency-Key": "idem-123" } }
    );
  });

  it("includes the persisted credit session token", async () => {
    localStorage.setItem("creditSessionToken", "bridge-token-123");

    const { submitApplication } = await import("../applications");
    await submitApplication({ hello: "world" });

    expect(postMock).toHaveBeenCalledWith(
      "/api/client/submissions",
      {
        hello: "world",
        ...expectedAttribution,
        creditSessionToken: "bridge-token-123",
      },
      { headers: undefined }
    );
  });
});
