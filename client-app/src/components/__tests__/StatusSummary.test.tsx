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
        ocr: { status: "pending", completedAt: null },
        banking: {
          status: "pending",
          completedAt: null,
          statementCount: 0,
          requiredStatements: 6,
        },
      },
    });
    const markup = renderSummary();
    expect(markup).toContain("Documents received");
    expect(markup).toContain("Pending");
    expect(markup).toContain("Statements received 0/6");
  });

  it("shows completed timestamp when OCR is complete", () => {
    const completedAt = "2024-01-01T00:00:00Z";
    mockedUseProcessingStatus.mockReturnValue({
      status: {
        ocr: { status: "completed", completedAt },
        banking: {
          status: "processing",
          completedAt: null,
          statementCount: 3,
          requiredStatements: 6,
        },
      },
    });
    const markup = renderSummary();
    expect(markup).toContain("Completed");
    expect(markup).toContain(new Date(completedAt).toLocaleString());
  });

  it("shows contact support when a stage fails", () => {
    mockedUseProcessingStatus.mockReturnValue({
      status: {
        ocr: { status: "failed", completedAt: null },
        banking: {
          status: "pending",
          completedAt: null,
          statementCount: 0,
          requiredStatements: 6,
        },
      },
    });
    const markup = renderSummary();
    expect(markup).toContain("Contact support");
  });
});
