import { ClientAppAPI } from "../api/clientApp";
import { resumeApplication } from "../services/resume";

export function useResumeApplication() {
  async function resume() {
    return resumeApplication({ fetchStatus: ClientAppAPI.status });
  }

  return { resume };
}
