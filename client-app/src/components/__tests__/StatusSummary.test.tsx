import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StatusSummary } from "../StatusSummary";

function renderSummary(status: any) {
  return renderToStaticMarkup(<StatusSummary status={status} />);
}

describe("StatusSummary", () => {
  it("shows documents processing when OCR is pending", () => {
    const markup = renderSummary({
      application: { ocr_completed_at: null, banking_completed_at: null },
      documents: { bank_statements: { count: 2 } },
    });
    expect(markup).toContain("Documents received");
    expect(markup).toContain("Documents processing");
  });

  it("shows documents processed when OCR is complete", () => {
    const markup = renderSummary({
      application: { ocr_completed_at: "2024-01-01T00:00:00Z" },
      documents: { bank_statements: { count: 2 } },
    });
    expect(markup).toContain("Documents processed");
  });

  it("shows waiting for statements when fewer than six are received", () => {
    const markup = renderSummary({
      application: { ocr_completed_at: null, banking_completed_at: null },
      documents: { bank_statements: { count: 5 } },
    });
    expect(markup).toContain("Waiting for statements");
  });

  it("shows banking analysis in progress when enough statements are received", () => {
    const markup = renderSummary({
      application: { ocr_completed_at: null, banking_completed_at: null },
      documents: { bank_statements: { count: 6 } },
    });
    expect(markup).toContain("Banking analysis in progress");
  });

  it("shows banking analysis completed when banking is complete", () => {
    const markup = renderSummary({
      application: { banking_completed_at: "2024-01-01T00:00:00Z" },
      documents: { bank_statements: { count: 2 } },
    });
    expect(markup).toContain("Banking analysis completed");
  });
});
