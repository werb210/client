import { describe, expect, it } from "vitest";
import {
  filterActiveProducts,
  isAmountWithinRange,
  parseCurrencyAmount,
} from "../productSelection";

describe("product selection helpers", () => {
  it("filters active products only", () => {
    const products = [
      { id: "1", status: "active" },
      { id: "2", status: "inactive" },
      { id: "3", status: "ACTIVE" },
    ];

    const result = filterActiveProducts(products as any);
    expect(result.map((item) => item.id)).toEqual(["1", "3"]);
  });

  it("parses currency and validates amount ranges", () => {
    const amount = parseCurrencyAmount("$25,000");
    expect(amount).toBe(25000);
    expect(isAmountWithinRange(amount, 10000, 50000)).toBe(true);
    expect(isAmountWithinRange(amount, 30000, 50000)).toBe(false);
  });
});
