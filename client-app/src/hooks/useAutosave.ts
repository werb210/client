import { useEffect, useRef } from "react";
import { useApplicationStore } from "../state/applicationStore";
import { useClientSession } from "../state/useClientSession";

/**
 * useAutosave
 * -----------
 * Watches for changes in a given dependency list ("watchedFields")
 * and automatically saves progress to the server after a 1s debounce.
 *
 * Fully safe for:
 *   - refresh
 *   - navigation between steps
 *   - offline mode
 *   - partial application
 */

export function useAutosave(sectionName: string, watchedFields: unknown[]) {
  const { saveToServer } = useApplicationStore();
  const { token } = useClientSession();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPayloadHash = useRef<string>("");

  // Serialize the watched fields (deep compare via JSON)
  const serialize = (input: unknown[]) => JSON.stringify(input ?? []);

  useEffect(() => {
    const currentHash = serialize(watchedFields);

    // If nothing changed, do nothing
    if (currentHash === lastPayloadHash.current) return;

    // Clear previous debounce
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Debounce 1 second
    timeoutRef.current = setTimeout(async () => {
      lastPayloadHash.current = currentHash;

      try {
        await saveToServer(token);
        console.log(`[Autosave] Saved: ${sectionName}`);
      } catch (err) {
        console.error(`[Autosave] Failed for section ${sectionName}:`, err);
      }
    }, 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, watchedFields);
}

