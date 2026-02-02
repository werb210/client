import { describe, expect, it } from "vitest";
import { getRejectionMessage, resolveDocumentStatus } from "../documentStatus";

describe("document status", () => {
  it("identifies rejected documents and returns a re-upload message", () => {
    const entry = { status: "rejected", rejection_reason: "Blurry image" };
    expect(resolveDocumentStatus(entry)).toBe("rejected");
    expect(getRejectionMessage(entry)).toContain("Blurry image");
  });
});
