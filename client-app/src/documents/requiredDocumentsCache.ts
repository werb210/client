import { OfflineStore } from "../state/offline";
import { ensureAlwaysRequiredDocuments, mergeRequirementLists } from "./requiredDocuments";
import { extractRequiredDocumentsFromStatus } from "./requiredDocumentsFromStatus";

export function syncRequiredDocumentsFromStatus(status: any) {
  const requiredFromStatus = extractRequiredDocumentsFromStatus(status);
  if (!requiredFromStatus) return null;

  const cached = OfflineStore.load() || {};
  const existing = cached.productRequirements?.aggregated || [];
  const merged = ensureAlwaysRequiredDocuments(
    mergeRequirementLists(existing, requiredFromStatus)
  );
  OfflineStore.save({
    ...cached,
    productRequirements: {
      ...(cached.productRequirements || {}),
      aggregated: merged,
    },
  });
  return merged;
}
