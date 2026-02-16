import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchReadinessBridge,
  fetchReadinessSession,
  mapContinuationToReadinessContext,
} from "../continuation";

const fetchWithRetryMock = vi.fn();

vi.mock("@/utils/fetchWithRetry", () => ({
  fetchWithRetry: fetchWithRetryMock,
}));

describe("continuation mapping", () => {
  beforeEach(() => {
    fetchWithRetryMock.mockReset();
  });

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
        collateral: true,
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
      collateral: true,
    });
  });

  it("prefers /api/readiness/:sessionId for continuation session lookup", async () => {
    fetchWithRetryMock.mockResolvedValue({
      ok: true,
      json: async () => ({ companyName: "Acme" }),
    });

    const response = await fetchReadinessSession("session-1");

    expect(fetchWithRetryMock).toHaveBeenCalledTimes(1);
    expect(fetchWithRetryMock).toHaveBeenCalledWith("/api/readiness/session-1");
    expect(response).toEqual({ companyName: "Acme" });
  });



  it("loads readiness bridge data from /api/readiness/bridge/:sessionToken", async () => {
    fetchWithRetryMock.mockResolvedValue({
      ok: true,
      json: async () => ({ step1: { industry: "Construction" } }),
    });

    const response = await fetchReadinessBridge("bridge-token-1");

    expect(fetchWithRetryMock).toHaveBeenCalledWith("/api/readiness/bridge/bridge-token-1");
    expect(response).toEqual({ step1: { industry: "Construction" } });
  });

  it("returns null for invalid readiness bridge token", async () => {
    fetchWithRetryMock.mockResolvedValue({ ok: false, status: 404 });

    const response = await fetchReadinessBridge("invalid-token");

    expect(response).toBeNull();
  });
  it("falls back to /api/readiness/session/:sessionId when primary route is not found", async () => {
    fetchWithRetryMock
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ companyName: "Fallback" }),
      });

    const response = await fetchReadinessSession("session-2");

    expect(fetchWithRetryMock).toHaveBeenNthCalledWith(1, "/api/readiness/session-2");
    expect(fetchWithRetryMock).toHaveBeenNthCalledWith(2, "/api/readiness/session/session-2");
    expect(response).toEqual({ companyName: "Fallback" });
  });
});
