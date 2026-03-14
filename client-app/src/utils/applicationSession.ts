const KEY = "bf_application_id";

export function setApplicationId(id: string): void {
  localStorage.setItem(KEY, id);
}

export function getApplicationId(): string | null {
  return localStorage.getItem(KEY);
}
