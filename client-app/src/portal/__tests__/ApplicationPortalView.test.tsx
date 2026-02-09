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
      "accept=\"application/pdf,image/png,image/jpeg,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.png,.jpg,.jpeg,.docx\""
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

  it("shows a read-only banner and disables uploads when locked", () => {
    const markup = renderToStaticMarkup(
      <ApplicationPortalView
        {...baseProps}
        documents={[{ category: "tax_returns", required: true, status: "missing" }]}
        readOnly
        readOnlyMessage="Uploads disabled"
      />
    );
    expect(markup).toContain("Read-only access");
    expect(markup).toContain("Uploads disabled");
    expect(markup).toContain("disabled");
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
      documentReviewCompletedAt: "2024-01-01T00:00:00Z",
      financialReviewCompletedAt: "2024-01-01T00:00:00Z",
    });
    expect(message).toBe(
      "Additional documents are required to continue processing your application."
    );
  });

  it("shows review messaging when processing is incomplete", () => {
    const message = getStatusBannerMessage({
      stage: "IN_REVIEW",
      documents: requiredDocs,
      documentReviewCompletedAt: null,
      financialReviewCompletedAt: "2024-01-01T00:00:00Z",
    });
    expect(message).toBe("Your documents have been received and are being reviewed.");
  });

  it("shows financial review messaging when bank statements uploaded", () => {
    const message = getStatusBannerMessage({
      stage: "IN_REVIEW",
      documents: [
        { category: "bank_statements", required: true, status: "uploaded" },
      ] as ApplicationDocumentCategory[],
      financialReviewCompletedAt: null,
    });
    expect(message).toBe("Your financial statements are being reviewed.");
  });

  it("shows prepared messaging when processing is complete", () => {
    const message = getStatusBannerMessage({
      stage: "IN_REVIEW",
      documents: requiredDocs,
      documentReviewCompletedAt: "2024-01-01T00:00:00Z",
      financialReviewCompletedAt: "2024-01-01T00:00:00Z",
    });
    expect(message).toBe("Your application is being prepared for the next step.");
  });
});
