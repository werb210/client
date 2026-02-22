import api from "../core/apiClient";

export async function sendMessageToMaya(message: string) {
  return api.post("/maya/client-chat", { message });
}

export async function escalateMayaChat() {
  return api.post("/maya/escalate");
}

export async function joinStartupWaitlist(data: { name: string; email: string; phone: string }) {
  return api.post("/crm/startup-waitlist", data);
}
