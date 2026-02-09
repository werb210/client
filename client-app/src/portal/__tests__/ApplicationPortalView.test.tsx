import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ApplicationPortalView,
  getStageHelperText,
} from "../ApplicationPortalView";

const baseProps = {
  businessName: "Acme Corp",
  stage: "DOCUMENTS_REQUIRED",
  helperText: getStageHelperText("DOCUMENTS_REQUIRED"),
  onUpload: vi.fn(),
  uploadState: {},
};

function renderPortal(documents: any[]) {
  return renderToStaticMarkup(
    <ApplicationPortalView {...baseProps} documents={documents} />
  );
}

describe("ApplicationPortalView", () => {
  it("loads the application header and stage", () => {
    const markup = renderPortal([]);
    expect(markup).toContain("Acme Corp");
    expect(markup).toContain("Documents Required");
    expect(markup).toContain("Please upload the requested documents");
  });

  it("renders required and optional document indicators", () => {
    const markup = renderPortal([
      { category: "bank_statements", required: true, status: "missing" },
      { category: "void_check", required: false, status: "missing" },
    ]);
    expect(markup).toContain("Required");
    expect(markup).toContain("Optional");
  });

  it("allows uploads with the expected file types", () => {
    const markup = renderPortal([
      { category: "tax_returns", required: true, status: "missing" },
    ]);
    expect(markup).toContain("Upload");
    expect(markup).toContain(
      "accept=\"application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg\""
    );
    expect(markup).not.toContain("disabled");
  });

  it("shows uploaded documents as Uploaded", () => {
    const markup = renderPortal([
      { category: "tax_returns", required: true, status: "uploaded" },
    ]);
    expect(markup).toContain("Uploaded");
  });

  it("shows rejection reasons", () => {
    const markup = renderPortal([
      {
        category: "tax_returns",
        required: true,
        status: "rejected",
        rejectionReason: "File was blurry",
      },
    ]);
    expect(markup).toContain("Rejected");
    expect(markup).toContain("Reason: File was blurry");
  });

  it("disables uploads once accepted", () => {
    const markup = renderPortal([
      { category: "tax_returns", required: true, status: "accepted" },
    ]);
    expect(markup).toContain("Upload");
    expect(markup).toContain("disabled");
  });

  it("does not include accept/reject controls", () => {
    const markup = renderPortal([
      { category: "tax_returns", required: true, status: "missing" },
    ]);
    expect(markup).not.toContain(">Accept<");
    expect(markup).not.toContain(">Reject<");
  });
});
