import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { StatusTimeline } from "../../components/StatusTimeline";
import { PIPELINE_STAGE_LABELS } from "../timeline";
import { getPipelineStage } from "../../realtime/pipeline";
import { getSubmissionFailureBanner } from "../submissionMessaging";

function flattenText(element: ReactElement): string {
  if (typeof element === "string") return element;
  if (!element?.props?.children) return "";
  const children = Array.isArray(element.props.children)
    ? element.props.children
    : [element.props.children];
  return children
    .filter(Boolean)
    .map((child: any) =>
      typeof child === "object" ? flattenText(child as ReactElement) : String(child)
    )
    .join(" ");
}

describe("timeline integration", () => {
  it("renders the updated pipeline stages", () => {
    const element = StatusTimeline({
      stages: PIPELINE_STAGE_LABELS,
      activeStage: "Documents Under Review",
    });
    const text = flattenText(element as ReactElement);
    expect(text).toContain("Application Submitted");
    expect(text).toContain("Documents Under Review");
    expect(text).toContain("Credit Summary Created");
    expect(text).toContain("Sent to Lender");
    expect(text).toContain("Accepted / Declined");
    expect(text).toContain("Requires Documents");
  });

  it("uses submission status for lender delivery", () => {
    const stage = getPipelineStage({ status: "In Review" }, { status: "submitted" });
    expect(stage).toBe("Sent to Lender");
  });

  it("keeps failure messaging generic", () => {
    const banner = getSubmissionFailureBanner("google_sheet_timeout");
    expect(banner.title).toBe("Application delayed");
    expect(banner.message).not.toContain("google_sheet_timeout");
  });
});
