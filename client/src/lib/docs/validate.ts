import type { RequiredDoc } from './requirements';

export type FileState = 'completed'|'uploading'|'error'|'queued'|'missing'|'verified'|'uploaded'|'rejected';

export function allRequiredDocsComplete(requiredDocs: RequiredDoc[], statesByKey: Record<string, FileState>): {
  ok: boolean; missing: string[]; invalid: string[];
} {
  const missing: string[] = [];
  const invalid: string[] = [];
  for (const d of requiredDocs) {
    if (!d.required) continue;
    const s = (statesByKey[d.key] ?? 'missing') as FileState;
    if (s === 'missing' || s === 'queued' || s === 'uploading' || s === 'error' || s === 'rejected') {
      // Rejected is not acceptable per your rule: must be "completed" (uploaded/verified)
      missing.push(d.key);
    }
    // Accept "completed", "uploaded", or "verified"
  }
  return { ok: missing.length === 0 && invalid.length === 0, missing, invalid };
}