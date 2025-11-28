import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

// Fetch server-driven Step 1 questions
export async function fetchStep1Questions() {
  return axios.get(`${API_BASE}/questions/step-1`);
}
