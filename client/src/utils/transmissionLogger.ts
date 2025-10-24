const STORAGE_KEY = 'bf:transmission-logs';

const isBrowser = typeof window !== 'undefined';

type TransmissionStatus = 'success' | 'failure' | 'pending';

export interface TransmissionLogEntry {
  event: string;
  status: TransmissionStatus;
  payload?: unknown;
  timestamp: string;
}

export function logTransmission(event: string, status: TransmissionStatus, payload?: unknown): void {
  if (!isBrowser) {
    return;
  }

  const entry: TransmissionLogEntry = {
    event,
    status,
    payload,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = window.localStorage?.getItem(STORAGE_KEY);
    const logs: TransmissionLogEntry[] = existing ? JSON.parse(existing) : [];
    logs.push(entry);
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('[TransmissionLogger] Failed to persist log entry', error);
  }

  if (import.meta.env.DEV) {
    console.info('[TransmissionLogger]', event, status, payload);
  }
}

export function getTransmissionLogs(): TransmissionLogEntry[] {
  if (!isBrowser) {
    return [];
  }

  try {
    const existing = window.localStorage?.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('[TransmissionLogger] Failed to read logs', error);
    return [];
  }
}

export function clearTransmissionLogs(): void {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage?.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[TransmissionLogger] Failed to clear logs', error);
  }
}
