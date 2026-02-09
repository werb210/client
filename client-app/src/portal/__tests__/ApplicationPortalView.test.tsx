import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ApplicationPortalView,
  ApplicationDocumentCategory,
  getStageHelperText,
  getStatusBannerMessage,
} from "../ApplicationPortalView";

const baseProps = {
  businessName: "Acme Corp",
  stage: "DOCUMENTS_REQUIRED",
  statusMessage: "Additional documents are required to continue processing your application.",
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
    expect(markup).toContain("Additional documents are required to continue processing your application.");
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

describe("getStatusBannerMessage", () => {
  const requiredDocs: ApplicationDocumentCategory[] = [
    { category: "tax_returns", required: true, status: "uploaded" },
  ];

  it("renders banner text for all stages", () => {
    const stages = [
      "RECEIVED",
      "IN_REVIEW",
      "DOCUMENTS_REQUIRED",
      "OFF_TO_LENDER",
      "OFFER",
      "ACCEPTED",
      "REJECTED",
    ];

    const messages = stages.map((stage) =>
      getStatusBannerMessage({ stage, documents: [] })
    );

    messages.forEach((message) => {
      expect(message).toBeTruthy();
      expect(message).not.toContain("ocr");
      expect(message).not.toContain("banking");
    });
  });

  it("prioritizes documents-required messaging over other states", () => {
    const message = getStatusBannerMessage({
      stage: "DOCUMENTS_REQUIRED",
      documents: requiredDocs,
      ocrCompletedAt: "2024-01-01T00:00:00Z",
      bankingCompletedAt: "2024-01-01T00:00:00Z",
    });
    expect(message).toBe(
      "Additional documents are required to continue processing your application."
    );
  });

  it("shows review messaging when OCR or banking is incomplete", () => {
    const message = getStatusBannerMessage({
      stage: "IN_REVIEW",
      documents: requiredDocs,
      ocrCompletedAt: null,
      bankingCompletedAt: "2024-01-01T00:00:00Z",
    });
    expect(message).toBe("Your documents have been received and are being reviewed.");
  });

  it("shows banking analysis messaging when bank statements uploaded", () => {
    const message = getStatusBannerMessage({
      stage: "IN_REVIEW",
      documents: [
        { category: "bank_statements", required: true, status: "uploaded" },
      ] as ApplicationDocumentCategory[],
      bankingCompletedAt: null,
    });
    expect(message).toBe("Your banking information is being analyzed.");
  });

  it("shows prepared messaging when processing is complete", () => {
    const message = getStatusBannerMessage({
      stage: "IN_REVIEW",
      documents: requiredDocs,
      ocrCompletedAt: "2024-01-01T00:00:00Z",
      bankingCompletedAt: "2024-01-01T00:00:00Z",
    });
    expect(message).toBe("Your application is being prepared for the next step.");
  });
});
