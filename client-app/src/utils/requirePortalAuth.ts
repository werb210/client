export function requirePortalAuth() {
  const params = new URLSearchParams(window.location.search);
  const queryApplicationId = params.get("applicationId");

  if (queryApplicationId) {
    localStorage.setItem("applicationId", queryApplicationId);
  }

  const token = localStorage.getItem("clientToken");
  const applicationId = queryApplicationId || localStorage.getItem("applicationId");

  if (!token || !applicationId) {
    window.location.href = "/";
    return false;
  }

  return { token, applicationId } as const;
}
