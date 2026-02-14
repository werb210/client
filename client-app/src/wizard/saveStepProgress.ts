import { saveApplicationStep } from "../api/applicationProgress";
import { ApplicationData } from "../types/application";

export async function persistApplicationStep(
  app: ApplicationData,
  step: number,
  data: Record<string, unknown>
) {
  const applicationId = app.applicationId || app.applicationToken;
  if (!applicationId) {
    throw new Error("Missing application id");
  }

  await saveApplicationStep({
    applicationId,
    step,
    data,
  });
}
