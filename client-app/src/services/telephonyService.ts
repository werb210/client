import { apiRequest } from "../api/request";

type CallStatus = {
  status: string;
  activeCall: boolean;
  timestamp?: string;
};

export async function getCallStatus(): Promise<CallStatus> {
  try {
    const data = await apiRequest<Partial<CallStatus>>("/api/telephony/presence", {
      method: "GET",
    });

    return {
      status: data?.status ?? "unknown",
      activeCall: data?.activeCall ?? false,
      timestamp: data?.timestamp,
    };
  } catch (error) {
    console.error("Client telephony polling error:", error);

    return {
      status: "offline",
      activeCall: false,
    };
  }
}
