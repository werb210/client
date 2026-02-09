import { api } from "./client";

export async function submitApplication(payload: unknown) {
  const res = await api.post("/api/client/submissions", payload);
  return res.data;
}

export async function createPublicApplication(payload: unknown) {
  const res = await api.post("/api/applications", payload);
  return res.data;
}
