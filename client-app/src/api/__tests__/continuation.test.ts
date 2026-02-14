import { describe, expect, it } from "vitest";
import { mapContinuationToReadinessContext } from "../continuation";

describe("continuation mapping", () => {
  it("maps snake_case readiness fields to client readiness model", () => {
    const mapped = mapContinuationToReadinessContext(
      {
        leadId: "lead-1",
        companyName: "Acme Inc",
        fullName: "Taylor Doe",
        email: "taylor@example.com",
        phone: "+15551234567",
        industry: "Construction",
        years_in_business: 3,
        monthly_revenue: 80000,
        annual_revenue: 960000,
        ar_outstanding: 120000,
        existing_debt: true,
      },
      "fallback-lead"
    );

    expect(mapped).toEqual({
      leadId: "lead-1",
      companyName: "Acme Inc",
      fullName: "Taylor Doe",
      email: "taylor@example.com",
      phone: "+15551234567",
      industry: "Construction",
      yearsInBusiness: 3,
      monthlyRevenue: 80000,
      annualRevenue: 960000,
      arOutstanding: 120000,
      existingDebt: true,
    });
  });
});
