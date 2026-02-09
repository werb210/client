import { API_BASE_URL } from "../api/client";
import { getClientSessionAuthHeader } from "../state/clientSession";

export type ClientSession = {
  applicationId: string;
  step: number;
  token: string;
  application?: any;
};

export async function loadSessionFromUrl(): Promise<ClientSession | null> {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) return null;

  const response = await fetch(
    `${API_BASE_URL}/api/client/session?token=${encodeURIComponent(token)}`,
    {
      headers: {
        ...getClientSessionAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to resume session");
  }

  const data = await response.json();
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
