import { normalizeRequirementList } from "../wizard/requirements";
import type { LenderProductRequirement } from "../wizard/requirements";

export function extractRequiredDocumentsFromStatus(
  status: any
): LenderProductRequirement[] | null {
  const raw =
    status?.requiredDocuments ||
    status?.required_documents ||
    status?.application?.requiredDocuments ||
    status?.application?.required_documents ||
    status?.requirements;

  if (!raw) return null;
  const normalized = normalizeRequirementList(raw);
  return normalized.length ? normalized : null;
}
