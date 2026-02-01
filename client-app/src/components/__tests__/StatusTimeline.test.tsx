import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { StatusTimeline } from "../StatusTimeline";

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

describe("StatusTimeline", () => {
  it("renders the portal status stages", () => {
    const element = StatusTimeline({
      stages: ["Application Received", "Under Review", "Approved"],
      activeStage: "Under Review",
    });
    const text = flattenText(element as ReactElement);
    expect(text).toContain("Application Received");
    expect(text).toContain("Under Review");
    expect(text).toContain("Approved");
  });
});
