import { api } from "./index";

// Fetch server-driven Step 1 questions
export async function fetchStep1Questions() {
  return api.get("/questions/step-1");
}
