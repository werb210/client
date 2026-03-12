import { apiRequest } from "../api/request";

export async function getCallStatus() {
  try {
    const response = await apiRequest("/telephony/call-status", {
      method: "GET"
    });

    if (!response.ok) {
      return {
        status: "unknown",
        activeCall: false
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Telephony status error:", error);

    return {
      status: "offline",
      activeCall: false
    };
  }
}
