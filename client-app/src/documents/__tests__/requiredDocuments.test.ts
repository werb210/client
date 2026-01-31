import { describe, expect, it } from "vitest";
import { aggregateRequiredDocuments } from "../requiredDocuments";

describe("aggregateRequiredDocuments", () => {
  it("aggregates document requirements across matching products", () => {
    const products = [
      {
        category: "Equipment Financing",
        requiredDocs: ["bank_statements", "equipment_quote"],
      },
      {
        category: "Equipment Financing",
        requiredDocs: ["ownership_info"],
      },
    ];
    const requirements = aggregateRequiredDocuments(
      products,
      "Equipment Financing",
      50000
    );
    const docTypes = requirements.map((entry) => entry.document_type);
    expect(docTypes.sort()).toEqual(
      ["bank_statements", "equipment_quote", "ownership_info"].sort()
    );
  });
});
