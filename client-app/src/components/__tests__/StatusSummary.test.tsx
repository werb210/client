import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StatusSummary } from "../StatusSummary";
import { useProcessingStatus } from "../../hooks/useProcessingStatus";

vi.mock("../../hooks/useProcessingStatus");

const mockedUseProcessingStatus = vi.mocked(useProcessingStatus);

function renderSummary() {
  return renderToStaticMarkup(<StatusSummary applicationId="app_123" />);
}

describe("StatusSummary", () => {
  it("shows pending placeholders when status is pending", () => {
    mockedUseProcessingStatus.mockReturnValue({
      status: {
        documentReview: { status: "pending", completedAt: null },
        financialReview: {
          status: "pending",
          completedAt: null,
          details: {
            receivedCount: 0,
            requiredCount: 6,
          },
        },
      },
      pollState: "polling",
    });
    const markup = renderSummary();
    expect(markup).toContain("Documents received");
    expect(markup).toContain("Pending");
    expect(markup).toContain("Statements received 0/6");
  });

  it("shows completed timestamp when a review is complete", () => {
    const completedAt = "2024-01-01T00:00:00Z";
    mockedUseProcessingStatus.mockReturnValue({
      status: {
        documentReview: { status: "completed", completedAt },
        financialReview: {
          status: "processing",
          completedAt: null,
          details: {
            receivedCount: 3,
            requiredCount: 6,
          },
        },
      },
      pollState: "polling",
    });
    const markup = renderSummary();
    expect(markup).toContain("Completed");
    expect(markup).toContain(new Date(completedAt).toLocaleString());
  });

  it("shows contact support when a stage fails", () => {
    mockedUseProcessingStatus.mockReturnValue({
      status: {
        documentReview: { status: "failed", completedAt: null },
        financialReview: {
          status: "pending",
          completedAt: null,
          details: {
            receivedCount: 0,
            requiredCount: 6,
          },
        },
      },
      pollState: "paused",
    });
    const markup = renderSummary();
    expect(markup).toContain("Contact support");
  });
});
