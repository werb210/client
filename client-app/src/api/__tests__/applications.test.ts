import { describe, expect, it, vi } from "vitest";

const postMock = vi.fn().mockResolvedValue({ data: { ok: true } });

vi.mock("../client", () => ({
  api: {
    post: postMock,
  },
}));

describe("submitApplication", () => {
  it("sends idempotency key when provided", async () => {
    const { submitApplication } = await import("../applications");
    await submitApplication({ hello: "world" }, { idempotencyKey: "idem-123" });
    expect(postMock).toHaveBeenCalledWith(
      "/api/client/submissions",
      { hello: "world" },
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
      { hello: "world", continuationToken: "cont-456" },
      { headers: { "Idempotency-Key": "idem-123" } }
    );
  });
});
