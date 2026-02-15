import api from "./api";

import type { ReadinessContext } from "@/state/readinessStore";
import { fetchWithRetry } from "@/utils/fetchWithRetry";

export interface ContinuationPayload {
  leadId?: string;
  readinessToken?: string;
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  industry?: string;
  yearsInBusiness?: number;
  monthlyRevenue?: number;
  annualRevenue?: number;
  arOutstanding?: number;
  existingDebt?: boolean;
  years_in_business?: number;
  monthly_revenue?: number;
  annual_revenue?: number;
  ar_outstanding?: number;
  existing_debt?: boolean;
}


function pickNumber(...values: Array<unknown>): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function pickBoolean(...values: Array<unknown>): boolean | undefined {
  for (const value of values) {
    if (typeof value === "boolean") return value;
  }
  return undefined;
}

export function mapContinuationToReadinessContext(
  payload: ContinuationPayload,
  fallbackLeadId: string
): ReadinessContext {
  return {
    leadId:
      (typeof payload.leadId === "string" && payload.leadId) ||
      fallbackLeadId,
    companyName: payload.companyName,
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    industry: payload.industry,
    yearsInBusiness: pickNumber(payload.yearsInBusiness, payload.years_in_business),
    monthlyRevenue: pickNumber(payload.monthlyRevenue, payload.monthly_revenue),
    annualRevenue: pickNumber(payload.annualRevenue, payload.annual_revenue),
    arOutstanding: pickNumber(payload.arOutstanding, payload.ar_outstanding),
    existingDebt: pickBoolean(payload.existingDebt, payload.existing_debt),
  };
}

export async function fetchContinuation(token: string): Promise<ContinuationPayload | null> {
  try {
    const res = await fetchWithRetry(`/api/readiness/${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    return (await res.json()) as ContinuationPayload;
  } catch {
    return null;
  }
}

export async function fetchReadinessSession(sessionId: string): Promise<ContinuationPayload | null> {
  try {
    const encodedSessionId = encodeURIComponent(sessionId);
    const primary = await fetchWithRetry(`/api/readiness/${encodedSessionId}`);
    if (primary.ok) {
      return (await primary.json()) as ContinuationPayload;
    }

    if (primary.status >= 500) {
      return null;
    }

    const fallback = await fetchWithRetry(`/api/readiness/session/${encodedSessionId}`);
    if (!fallback.ok) return null;
    return (await fallback.json()) as ContinuationPayload;
  } catch {
    return null;
  }
}

export async function getContinuationSession() {
  try {
    const res = await api.get("/continuation/session");
    return res.data;
  } catch {
    return null;
  }
}
