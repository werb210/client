import { describe, expect, it, vi } from "vitest";
import { ClientProfileStore } from "../../state/clientProfiles";
import {
  buildSubmissionPayload,
  getPostSubmitRedirect,
  getMissingRequiredDocs,
  shouldBlockForMissingDocuments,
} from "../submission";
import type { ApplicationData } from "../../types/application";

vi.mock("../../state/clientProfiles", () => ({
  ClientProfileStore: {
    hasPortalSession: vi.fn(),
  },
}));

describe("submission payload", () => {
  const baseApp: ApplicationData = {
    kyc: { fundingAmount: 4000 },
    productCategory: "Working Capital",
    matchPercentages: {},
    eligibleProducts: [],
    eligibleCategories: [],
    eligibilityReasons: [],
    business: { legalName: "Acme Co" },
    applicant: { fullName: "Taylor Doe" },
    documents: {
      bank_statements: {
        name: "bank.pdf",
        base64: "abc123",
        category: "bank_statements",
        productId: "prod-1",
        status: "uploaded",
      },
    },
    productRequirements: {
      "prod-1": [
        { id: "req-1", document_type: "bank_statements", required: true },
      ],
    },
    documentsDeferred: false,
    selectedProduct: {
      id: "prod-1",
      name: "Starter Loan",
      product_type: "Loan",
      lender_id: "lender-a",
    },
    selectedProductId: "prod-1",
    selectedProductType: "Loan",
    requires_closing_cost_funding: false,
    termsAccepted: true,
    typedSignature: "Taylor Doe",
    signatureDate: "2024-10-04",
    applicationToken: "token-123",
    applicationId: "app-123",
    currentStep: 6,
  };

  it("includes lender product id, application data, and document metadata", () => {
    const payload = buildSubmissionPayload(baseApp);
    expect(payload.lender_product_id).toBe("prod-1");
    expect(payload.application.business).toEqual({ legalName: "Acme Co" });
    expect(payload.documents).toEqual([
      {
        document_type: "bank_statements",
        name: "bank.pdf",
        category: "bank_statements",
        product_id: "prod-1",
        status: "uploaded",
      },
    ]);
  });

  it("detects missing required documents", () => {
    const missing = getMissingRequiredDocs({
      ...baseApp,
      documents: {},
    });
    expect(missing.map((entry) => entry.document_type)).toEqual([
      "bank_statements",
    ]);
  });

  it("allows skipping documents when deferred", () => {
    const shouldBlock = shouldBlockForMissingDocuments({
      ...baseApp,
      documents: {},
      documentsDeferred: true,
    });
    expect(shouldBlock).toBe(false);
  });

  it("redirects submitted applicants to the portal by default", () => {
    vi.mocked(ClientProfileStore.hasPortalSession).mockReturnValue(false);
    expect(getPostSubmitRedirect("token-123")).toBe("/portal");
  });
});
