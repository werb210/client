import api from "@/lib/api";

export async function escalateToHuman() {
  await api.post("/ai/escalate");
}
