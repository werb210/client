export type Step = 1 | 3 | 4;
export type StepData = Record<string, unknown>;

const DRAFT_PREFIX = "client:draft:step:";

function getDraftKey(step: Step) {
  return `${DRAFT_PREFIX}${step}`;
}

export function saveStepData(
  step: Step,
  data: StepData,
  storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null
) {
  if (!storage) return;
  try {
    storage.setItem(getDraftKey(step), JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save step draft:", error);
  }
}

export function loadStepData(
  step: Step,
  storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null
): StepData | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(getDraftKey(step));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as StepData;
  } catch (error) {
    console.warn("Failed to load step draft:", error);
    return null;
  }
}

export function mergeDraft<T extends Record<string, any>>(current: T, draft: StepData): T {
  const next = { ...current };
  Object.entries(draft).forEach(([key, value]) => {
    if (next[key] === undefined || next[key] === null || next[key] === "") {
      (next as Record<string, unknown>)[key as string] = value;
    }
  });
  return next;
}

export function clearDraft(
  storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null
) {
  if (!storage) return;
  try {
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
    keys.forEach((key) => {
      if (key && key.startsWith(DRAFT_PREFIX)) {
        storage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Failed to clear step drafts:", error);
  }
}
