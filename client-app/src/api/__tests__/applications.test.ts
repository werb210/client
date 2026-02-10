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
});
