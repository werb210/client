import { apiFetch } from "../lib/apiFetch";

export async function createApplication(data: unknown) {
  return apiFetch("/api/application", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateApplication(data: unknown) {
  return apiFetch("/api/application/update", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getContinuation() {
  return apiFetch("/api/application/continuation");
}
