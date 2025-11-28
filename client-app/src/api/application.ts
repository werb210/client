import axios from "axios";

import { Step1Payload } from "../types/application";

const API_BASE = import.meta.env.VITE_API_BASE;

export async function saveStep1(payload: Step1Payload) {
  const res = await axios.post(`${API_BASE}/application/step-1`, payload, {
    withCredentials: true
  });

  return res.data;
}
