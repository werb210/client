const KEY = "bf:firstVisitDone";

export function isFirstVisit() {
  return !localStorage.getItem(KEY);
}

export function markFirstVisit() {
  localStorage.setItem(KEY, "true");
}