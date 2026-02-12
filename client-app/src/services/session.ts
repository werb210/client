import { getClientSessionAuthHeader } from "../state/clientSession";
import { apiRequest } from "../lib/api";

export type ClientSession = {
  applicationId: string;
  step: number;
  token: string;
  application?: unknown;
};

type SessionResponse = {
  applicationId: string;
  application?: unknown;
  nextIncompleteStep?: number;
  nextStep?: number;
  step?: number;
  lastCompletedStep?: number;
};

export async function loadSessionFromUrl(): Promise<ClientSession | null> {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) return null;

  const data = await apiRequest<SessionResponse>(
    `/api/client/session?token=${encodeURIComponent(token)}`,
    {
      headers: {
        ...getClientSessionAuthHeader(),
      },
    }
  );

  const serverStep =
    Number(data.nextIncompleteStep ?? data.nextStep ?? data.step) || null;
  const lastCompletedStep = Number(data.lastCompletedStep ?? 0);
  const step = Math.max(1, serverStep || lastCompletedStep + 1);

  return {
    applicationId: data.applicationId,
    step,
    token,
    application: data.application,
  };
}
