import { describe, expect, it } from "vitest";
import { getPipelineStage } from "../pipeline";

describe("pipeline stage mapping", () => {
  it("prioritizes rejected documents", () => {
    expect(getPipelineStage({ documents: { bank_statements: { status: "rejected" } } })).toBe(
      "Documents Required"
    );
  });

  it("maps known statuses to portal stages", () => {
    expect(getPipelineStage({ status: "In Review" })).toBe("In Review");
    expect(getPipelineStage({ status: "Off to lender" })).toBe("Off to Lender");
    expect(getPipelineStage({ status: "Startup" })).toBe("Startup");
    expect(getPipelineStage({ status: "Accepted" })).toBe("Accepted");
    expect(getPipelineStage({ status: "Declined" })).toBe("Declined");
  });
});
