import { describe, expect, it } from "vitest";
import { getPipelineStage } from "../pipeline";

describe("pipeline stage mapping", () => {
  it("prioritizes rejected documents", () => {
    expect(
      getPipelineStage({ documents: { bank_statements: { status: "rejected" } } })
    ).toBe("Requires Documents");
  });

  it("maps known statuses to portal stages", () => {
    expect(getPipelineStage({ status: "In Review" })).toBe(
      "Documents Under Review"
    );
    expect(getPipelineStage({ status: "Off to lender" })).toBe("Sent to Lender");
    expect(getPipelineStage({ status: "Processing" })).toBe("In Review");
    expect(getPipelineStage({ status: "Accepted" })).toBe("Accepted / Declined");
    expect(getPipelineStage({ status: "Declined" })).toBe("Accepted / Declined");
  });

  it("uses submission status for lender delivery", () => {
    expect(getPipelineStage({ status: "In Review" }, { status: "submitted" })).toBe(
      "Sent to Lender"
    );
  });
});
