import { describe, expect, it } from "vitest";
import {
  filterRequirementsByAmount,
  normalizeRequirementList,
  sortRequirements,
} from "../requirements";

describe("requirements normalization", () => {
  it("normalizes lender product requirements and filters by amount", () => {
    const raw = [
      {
        id: "req-1",
        document_type: "bank_statements",
        required: true,
      },
      "tax_returns",
      {
        id: "req-2",
        document_type: "financials",
        required: true,
        min_amount: 50000,
      },
      {
        id: "req-3",
        document_type: "ownership",
        required: false,
        max_amount: 20000,
      },
    ];

    const normalized = normalizeRequirementList(raw);
    const filtered = filterRequirementsByAmount(normalized, 60000);

    expect(normalized).toHaveLength(4);
    expect(filtered.map((entry) => entry.document_type)).toEqual([
      "bank_statements",
      "tax_returns",
      "financials",
    ]);
  });

  it("sorts required documents before optional", () => {
    const normalized = normalizeRequirementList([
      { id: "1", document_type: "optional_doc", required: false },
      { id: "2", document_type: "required_doc", required: true },
    ]);
    const sorted = sortRequirements(normalized);

    expect(sorted.map((entry) => entry.document_type)).toEqual([
      "required_doc",
      "optional_doc",
    ]);
  });
});
