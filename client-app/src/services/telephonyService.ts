import { apiRequest } from "../api/request";

export async function getCallStatus() {
  const response = await apiRequest("/telephony/call-status", {
    method: "GET"
  });

  if (!response.ok) {
    throw new Error("Failed to fetch call status");
  }

  return response.json();
}
