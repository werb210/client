const KEY_APPLY_STARTED   = "bf:applyStarted";     // set when user first lands on step-1
const KEY_PORTAL_DEFAULT  = "bf:portalDefault";    // set after they reach portal page

export function shouldGoToApplication() {
  return !localStorage.getItem(KEY_APPLY_STARTED);
}

export function markApplicationStarted() {
  localStorage.setItem(KEY_APPLY_STARTED, "true");
}

export function shouldShowPortalAfterLogin() {
  return !!localStorage.getItem(KEY_PORTAL_DEFAULT);
}

export function markPortalDefault() {
  localStorage.setItem(KEY_PORTAL_DEFAULT, "true");
}