import { apiFetch } from "../lib/apiFetch";

export function createApplication(data: any) {
  return apiFetch("/api/application", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateApplication(data: any) {
  return apiFetch("/api/application/update", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getContinuation() {
  return apiFetch("/api/application/continuation");
}
