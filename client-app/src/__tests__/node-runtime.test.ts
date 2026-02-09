import { describe, expect, it } from "vitest";
import packageJson from "../../package.json";
import nvmrcContent from "../../../.nvmrc?raw";

describe("Node runtime configuration", () => {
  it("declares Node 22+ in package.json engines", () => {
    expect(packageJson.engines?.node).toBe(">=22.0.0");
  });

  it("pins Node 22 in the repo .nvmrc", () => {
    expect(nvmrcContent.trim()).toBe("22");
  });
});
