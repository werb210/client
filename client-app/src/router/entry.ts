export function getEntryRoute(hasSubmittedApplication: boolean) {
  return hasSubmittedApplication ? "/portal" : "/apply";
}
