import { describe, expect, it } from "vitest";

describe("runtime requirements", () => {
  it("runs on Node 20+", () => {
    const major = Number(process.versions.node.split(".")[0]);
    expect(major >= 20).toBe(true);
  });
});
