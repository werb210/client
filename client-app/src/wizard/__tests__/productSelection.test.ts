import { describe, expect, it } from "vitest";
import {
  buildCategorySummaries,
  filterProductsForApplicant,
  getMatchingProducts,
  groupProductsByLender,
  type ActiveProduct,
} from "../productSelection";

describe("product selection filters", () => {
  const products: ActiveProduct[] = [
    {
      id: "prod-1",
      name: "Starter Loan",
      lender_id: "lender-a",
      lender_name: "Atlas Capital",
      country: "US",
      amount_min: 1000,
      amount_max: 5000,
      term: "12 mo",
      rate: "8%",
      required_documents: ["bank_statements"],
    },
    {
      id: "prod-2",
      name: "Growth Loan",
      lender_id: "lender-b",
      lender_name: "Beacon Bank",
      country: "CA",
      amount_min: 2000,
      amount_max: 10000,
      term: "24 mo",
      rate: "9%",
      required_documents: ["tax_returns"],
    },
    {
      id: "prod-3",
      name: "Expansion Loan",
      lender_id: "lender-a",
      lender_name: "Atlas Capital",
      country: "US",
      amount_min: 6000,
      amount_max: 15000,
      term: "36 mo",
      rate: "10%",
      required_documents: ["financials"],
    },
  ];

  it("filters products by country and amount", () => {
    const filtered = filterProductsForApplicant(products, "US", 3000);
    expect(filtered.map((product) => product.id)).toEqual(["prod-1"]);
  });

  it("groups filtered products by lender", () => {
    const filtered = filterProductsForApplicant(products, "US", 7000);
    const grouped = groupProductsByLender(filtered);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].lenderName).toBe("Atlas Capital");
    expect(grouped[0].products.map((product) => product.id)).toEqual(["prod-3"]);
  });

  it("counts matching products by category", () => {
    const summaries = buildCategorySummaries(products, "US", 3500);
    const entry = summaries.find((summary) => summary.category === "Starter Loan");
    expect(entry?.matchingCount).toBe(1);
    const matching = getMatchingProducts(products, "US", 3500, "Starter Loan");
    expect(matching.map((product) => product.id)).toEqual(["prod-1"]);
  });
});
