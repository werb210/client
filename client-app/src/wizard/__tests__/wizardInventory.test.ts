import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import inventory from "../../_artifacts/wizard-field-inventory.json";

describe("wizard-field-inventory", () => {
  it("includes steps 1 through 6", () => {
    const steps = inventory.map((entry) => entry.step);
    expect(steps).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("includes at least one field per step", () => {
    inventory.forEach((entry) => {
      expect(entry.fields.length).toBeGreaterThan(0);
    });
  });

  it("does not duplicate field names across steps unless explicitly shared", () => {
    const allowedShared = new Set([
      "currentStep",
      "documents",
      "documentsDeferred",
      "documentReviewComplete",
      "financialReviewComplete",
      "productCategory",
      "selectedProduct",
      "selectedProductId",
      "selectedProductType",
      "requires_closing_cost_funding",
      "eligibleProducts",
      "eligibleCategories",
      "eligibilityReasons",
    ]);
    const seen = new Map<string, number[]>();

    inventory.forEach((entry) => {
      entry.fields.forEach((field) => {
        const existing = seen.get(field) || [];
        existing.push(entry.step);
        seen.set(field, existing);
      });
    });

    const unexpectedDuplicates = Array.from(seen.entries()).filter(
      ([field, steps]) => steps.length > 1 && !allowedShared.has(field)
    );

    expect(unexpectedDuplicates).toEqual([]);
  });

  it("references files that exist in the repository", () => {
    inventory.forEach((entry) => {
      const resolved = resolve(process.cwd(), entry.file);
      expect(existsSync(resolved)).toBe(true);
    });
  });
});
