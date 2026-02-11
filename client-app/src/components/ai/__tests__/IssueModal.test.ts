import { describe, expect, it, vi } from "vitest";

vi.mock("../../../utils/html2canvas", () => ({
  default: vi.fn(async () => ({
    toDataURL: () => "data:image/png;base64,test",
  })),
}));

import { capturePageScreenshot } from "../IssueModal";

describe("IssueModal", () => {
  it("screenshot capture works", async () => {
    (globalThis as any).document = { body: {} };
    const result = await capturePageScreenshot();
    expect(result).toBe("data:image/png;base64,test");
  });
});
