import { describe, expect, it, vi } from "vitest";

const { post } = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock("../client", () => ({
  api: { post },
}));

import { AiApi } from "../ai";

describe("AiApi", () => {
  it("message sends and AI response appears", async () => {
    post.mockResolvedValueOnce({ data: { reply: "Hello", escalate: false } });

    const response = await AiApi.chat({
      sessionId: "session-1",
      message: "Need funding help",
      pageContext: {
        pageUrl: "https://example.com/apply",
        currentProductPage: null,
        country: "US",
        language: "en-US",
      },
      userType: "visitor",
    });

    expect(post).toHaveBeenCalledWith("/api/ai/chat", expect.objectContaining({ message: "Need funding help" }));
    expect(response.reply).toBe("Hello");
  });

  it("escalation triggers", async () => {
    post.mockResolvedValueOnce({ data: { queued: true } });
    const response = await AiApi.escalate("session-2");
    expect(post).toHaveBeenCalledWith("/api/ai/escalate", { sessionId: "session-2" });
    expect(response.queued).toBe(true);
  });

  it("issue report posts", async () => {
    post.mockResolvedValueOnce({ data: {} });
    await AiApi.reportIssue({
      description: { activity: "Submitting", issue: "Failed upload" },
      pageUrl: "https://example.com",
      screenshotBase64: "data:image/png;base64,abc",
      userAgent: "vitest",
    });

    expect(post).toHaveBeenCalledWith(
      "/api/ai/report",
      expect.objectContaining({ pageUrl: "https://example.com" })
    );
  });
});
