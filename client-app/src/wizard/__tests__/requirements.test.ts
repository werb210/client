import { describe, expect, it } from "vitest";
import { getRequiredDocuments, normalizeRequirements } from "../requirements";

describe("requirements normalization", () => {
  it("applies conditional requirements based on amount and product type", () => {
    const raw = {
      required: ["bank_statements_6m"],
      optional: ["ownership_docs"],
      conditional: [
        {
          label: "High amount",
          documents: ["financial_statements"],
          min_amount: 50000,
        },
        {
          label: "Equipment only",
          documents: ["equipment_quote"],
          product_type: "equipment_financing",
        },
      ],
    };

    const requirements = normalizeRequirements(raw, {
      amountRequested: 60000,
      productType: "equipment_financing",
    });
    const requiredDocs = getRequiredDocuments(requirements);

    expect(requiredDocs).toEqual(
      expect.arrayContaining([
        "bank_statements_6m",
        "financial_statements",
        "equipment_quote",
      ])
    );
    expect(requirements.optional).toEqual(["ownership_docs"]);
  });
});
