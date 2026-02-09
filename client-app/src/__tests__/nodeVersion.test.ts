import { describe, expect, it } from "vitest";

describe("runtime requirements", () => {
  it("runs on Node 22.x", () => {
    const major = Number(process.versions.node.split(".")[0]);
    expect(major).toBeGreaterThanOrEqual(22);
    expect(major).toBeLessThan(23);
  });
});
