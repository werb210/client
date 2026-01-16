export type ClientSession = {
  applicationId: string;
  step: number;
  token: string;
};

export async function loadSessionFromUrl(): Promise<ClientSession | null> {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) return null;

  const response = await fetch(
    `/api/client/session?token=${encodeURIComponent(token)}`
  );

  if (!response.ok) {
    throw new Error("Unable to resume session");
  }

  const data = await response.json();
  const lastCompletedStep = Number(data.lastCompletedStep ?? 0);
  const step = Math.max(1, lastCompletedStep + 1);

  return {
    applicationId: data.applicationId,
    step,
    token,
  };
}
