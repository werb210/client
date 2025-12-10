import { OfflineStore } from "../state/offline";
import { ClientAppAPI } from "../api/clientApp";

export function useResumeApplication() {
  async function resume() {
    const cached = OfflineStore.load();
    if (!cached?.applicationToken) return null;

    const res = await ClientAppAPI.status(cached.applicationToken);

    return {
      token: cached.applicationToken,
      status: res.data,
      cached
    };
  }

  return { resume };
}
