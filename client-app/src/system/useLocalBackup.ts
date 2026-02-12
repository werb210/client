import { useEffect } from "react";

const BACKUP_KEY = "client_backup";

export function useLocalBackup(appState: any) {
  useEffect(() => {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(appState));
  }, [appState]);
}

export function loadLocalBackup<T = unknown>() {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (!backup) return null;
    return JSON.parse(backup) as T;
  } catch {
    return null;
  }
}
