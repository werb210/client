import { useSyncExternalStore } from "react";

export type ReadinessContext = {
  leadId: string;
  companyName?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  industry?: string;
  yearsInBusiness?: number;
  monthlyRevenue?: number;
  annualRevenue?: number;
  arOutstanding?: number;
  collateral?: boolean;
};

type ReadinessState = ReadinessContext | null;

let readinessState: ReadinessState = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return readinessState;
}

export function setReadiness(readiness: ReadinessContext) {
  readinessState = readiness;
  notify();
}

export function clearReadiness() {
  readinessState = null;
  notify();
}

export function useReadiness() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getReadiness() {
  return readinessState;
}
