import { apiRequest } from "../api/request";

type CallStatus = {
  status: string;
  activeCall: boolean;
  timestamp?: string;
};

export async function getCallStatus(): Promise<CallStatus> {
  try {
    const response = await apiRequest("/api/telephony/presence", {
      method: "GET"
    });

    if (!response.ok) {
      return {
        status: "unknown",
        activeCall: false
      };
    }

    const data = await response.json();

    return {
      status: data?.status ?? "unknown",
      activeCall: data?.activeCall ?? false,
      timestamp: data?.timestamp
    };
  } catch (error) {
    console.error("Client telephony polling error:", error);

    return {
      status: "offline",
      activeCall: false
    };
  }
}
