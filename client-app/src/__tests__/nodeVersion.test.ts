import { describe, expect, it } from "vitest";

describe("runtime requirements", () => {
  it("runs on Node 22.x", () => {
    expect(process.versions.node.startsWith("22")).toBe(true);
  });
});
