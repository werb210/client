import api from "./api";

export async function escalateToHuman() {
  await api.post("/ai/escalate");
}
